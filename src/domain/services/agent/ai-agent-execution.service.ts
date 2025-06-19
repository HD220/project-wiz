// src/domain/services/agent/ai-agent-execution.service.ts
import { injectable, inject } from 'inversify';
import { TYPES } from '@/infrastructure/ioc/types';
import { IAIAgentRepository } from '@/domain/repositories/i-ai-agent.repository';
import { ILLMService } from '@/domain/services/i-llm.service'; // Assuming this path is correct
import { IToolRegistry } from '@/domain/services/i-tool-registry.service'; // Assuming this path is correct
import { Job } from '@/domain/entities/job.entity';
import { AIAgent } from '@/domain/entities/ai-agent.entity';
import { IAIAgentExecutionService, AgentJobProcessor } from './i-ai-agent-execution.service';
import { DelayedError, WaitingChildrenError } from '@/infrastructure/workers/generic.worker'; // Assuming path

@injectable()
export class AIAgentExecutionService implements IAIAgentExecutionService {
  constructor(
    @inject(TYPES.IAIAgentRepository) private aiAgentRepository: IAIAgentRepository,
    @inject(TYPES.ILLMService) private llmService: ILLMService,
    @inject(TYPES.IToolRegistry) private toolRegistry: IToolRegistry
  ) {}

  public getJobProcessorForAgent(agentId: string): AgentJobProcessor {
    return async (job: Job): Promise<any> => {
      console.log(`[AIAgentExecutionService] Job ${job.id} received for agent ${agentId}. Payload: ${JSON.stringify(job.payload)}`);

      const agentProfile = await this.aiAgentRepository.findById(agentId);
      if (!agentProfile) {
        job.fail(`AIAgent profile ${agentId} not found for job ${job.id}.`);
        console.error(`[AIAgentExecutionService] AIAgent profile ${agentId} not found for job ${job.id}.`);
        return { error: `AIAgent profile ${agentId} not found.` };
      }

      console.log(`[AIAgentExecutionService] Agent ${agentProfile.name} (Model: ${agentProfile.modelId}) processing job ${job.id}.`);

      // Check for Git Worktree Task
      if (job.payload?.isGitWorktreeTask === true) {
        const {
          gitRepoSubDir, // e.g., "my_project_clone" (relative to ExecuteCommandTool.DEFAULT_WORKING_DIR)
          gitBaseBranch, // e.g., "main"
          gitNewBranchName, // e.g., "feature/agent-job123"
          gitWorktreeName, // e.g., "job123_worktree" (this is just the dir name, will be sibling to gitRepoSubDir)
          gitCommandsInWorktree, // array of objects: { command: string, args?: string[] }
          gitCommitMessage,
        } = job.payload;

        // Validate required Git parameters
        if (!gitRepoSubDir || !gitBaseBranch || !gitNewBranchName || !gitWorktreeName || !gitCommandsInWorktree || !gitCommitMessage) {
          job.fail("Missing required parameters for Git worktree task.");
          console.error(`[AIAgentExecutionService] Job ${job.id}: Missing required parameters for Git worktree task.`);
          return { error: "Missing required parameters for Git worktree task." };
        }

        console.log(`[AIAgentExecutionService] Job ${job.id}: Starting Git worktree task for repo ${gitRepoSubDir}, branch ${gitNewBranchName}`);
        job.updateJobData({ currentStep: 'git_worktree_setup' });

        // Path definitions:
        // ExecuteCommandTool.DEFAULT_WORKING_DIR is the root (e.g. /app/agent_command_workspace)
        // gitRepoSubDir is relative to this root (e.g. "my_cloned_repo")
        // gitWorktreeName is also relative to this root (e.g. "job123_worktree")
        // So, git worktree add command path for worktree is `../${gitWorktreeName}` when CWD is gitRepoSubDir

        try {
          console.log(`[AIAgentExecutionService] Job ${job.id}: Creating Git worktree '${gitWorktreeName}' from branch '${gitBaseBranch}' into new branch '${gitNewBranchName}'. CWD: ${gitRepoSubDir}`);
          await this.toolRegistry.executeTool('execute_command', {
            command: 'git',
            args: ['worktree', 'add', '-b', gitNewBranchName, `../${gitWorktreeName}`, gitBaseBranch],
            working_directory: gitRepoSubDir
          });
          job.updateJobData({ currentStep: 'git_worktree_created' });
          console.log(`[AIAgentExecutionService] Job ${job.id}: Git worktree created successfully.`);

          console.log(`[AIAgentExecutionService] Job ${job.id}: Executing commands in worktree '${gitWorktreeName}'.`);
          job.updateJobData({ currentStep: 'git_commands_execution' });
          for (const cmdObj of gitCommandsInWorktree) {
            console.log(`[AIAgentExecutionService] Job ${job.id}: Executing in worktree: ${cmdObj.command} ${cmdObj.args?.join(' ')}`);
            const cmdResult = await this.toolRegistry.executeTool('execute_command', {
              command: cmdObj.command,
              args: cmdObj.args,
              working_directory: gitWorktreeName // Commands run inside the worktree directory
            });
            console.log(`[AIAgentExecutionService] Job ${job.id}: Command output: ${JSON.stringify(cmdResult)}`);
            // Add more robust output handling or checking if needed
          }
          job.updateJobData({ currentStep: 'git_commands_completed' });

          console.log(`[AIAgentExecutionService] Job ${job.id}: Adding changes to Git in worktree '${gitWorktreeName}'.`);
          await this.toolRegistry.executeTool('execute_command', {
            command: 'git',
            args: ['add', '.'],
            working_directory: gitWorktreeName
          });

          console.log(`[AIAgentExecutionService] Job ${job.id}: Committing changes in worktree '${gitWorktreeName}'.`);
          await this.toolRegistry.executeTool('execute_command', {
            command: 'git',
            args: ['commit', '-m', gitCommitMessage],
            working_directory: gitWorktreeName
          });
          job.updateJobData({ currentStep: 'git_commit_completed' });

          console.log(`[AIAgentExecutionService] Job ${job.id}: Git worktree operations completed successfully.`);
          // Note: Job is not marked 'completed' here by job.complete(), worker handles that with this result.
          return { success: true, message: "Git worktree operations completed.", worktreePath: gitWorktreeName, newBranch: gitNewBranchName };

        } catch (error: any) {
          console.error(`[AIAgentExecutionService] Job ${job.id}: Error during Git worktree operation: ${error.message}`, error);
          job.fail(`Git worktree operation failed: ${error.message}`);
          return { success: false, error: error.message };
        } finally {
          console.log(`[AIAgentExecutionService] Job ${job.id}: Cleaning up Git worktree '${gitWorktreeName}'.`);
          job.updateJobData({ currentStep: 'git_worktree_cleanup' });
          try {
            await this.toolRegistry.executeTool('execute_command', {
              command: 'git',
              args: ['worktree', 'remove', `../${gitWorktreeName}`, '--force'],
              working_directory: gitRepoSubDir // remove command run from original repo dir
            });
            console.log(`[AIAgentExecutionService] Job ${job.id}: Worktree '${gitWorktreeName}' removed successfully.`);
          } catch (cleanupError: any) {
            console.error(`[AIAgentExecutionService] Job ${job.id}: Failed to remove worktree '${gitWorktreeName}': ${cleanupError.message}`, cleanupError);
            // Log error but don't overwrite original failure state or turn success into failure
          }

          // Optional: Remove the branch (use with caution, depends on workflow)
          // For now, let's assume the branch should persist for review or merging.
          // If removal is desired:
          // try {
          //   console.log(`[AIAgentExecutionService] Job ${job.id}: Deleting branch '${gitNewBranchName}'.`);
          //   await this.toolRegistry.executeTool('execute_command', {
          //     command: 'git',
          //     args: ['branch', '-D', gitNewBranchName],
          //     working_directory: gitRepoSubDir
          //   });
          //   console.log(`[AIAgentExecutionService] Job ${job.id}: Branch '${gitNewBranchName}' deleted successfully.`);
          // } catch (branchDeleteError: any) {
          //   console.error(`[AIAgentExecutionService] Job ${job.id}: Failed to delete branch '${gitNewBranchName}': ${branchDeleteError.message}`, branchDeleteError);
          // }
        }
      } else {
        // Existing (simulated LLM) logic for non-Git tasks
        const taskInput = job.payload?.taskInput || job.payload?.goal || '';
        let conversationHistory = job.props.data?.conversationHistory || [];
        let currentStep = job.props.data?.currentStep || 'initial_processing';

        if (taskInput && (currentStep === 'initial_processing' || job.payload?.isNewMessage)) {
            conversationHistory.push({ role: 'user', content: taskInput });
        }
        job.updateJobData({ conversationHistory, currentStep: 'processing_llm_request' });

        try {
          console.log(`[AIAgentExecutionService] Simulating LLM call for job ${job.id} with agent ${agentProfile.name}.`);
          let llmResponseText = `Simulated LLM response for task: "${taskInput}" by agent ${agentProfile.name}.`;
          let needsToolCall = job.payload?.simulateToolCall || false;
          let toolCallDetails: any = null;

          if (needsToolCall) {
              toolCallDetails = {
                  toolName: job.payload.toolName || 'DummyTool',
                  toolCallId: `tool_${Date.now()}`,
                  args: job.payload.toolArgs || { query: "test" }
              };
              llmResponseText = `Simulated LLM response requesting tool ${toolCallDetails.toolName}.`;
              conversationHistory.push({ role: 'assistant', content: null, toolCalls: [toolCallDetails] });
              currentStep = 'tool_execution_pending';
          } else {
              conversationHistory.push({ role: 'assistant', content: llmResponseText });
              currentStep = 'llm_response_complete';
          }
          job.updateJobData({ conversationHistory, currentStep });

          if (needsToolCall && toolCallDetails) {
            console.log(`[AIAgentExecutionService] Simulating tool execution for ${toolCallDetails.toolName}.`);
            const toolResult = { success: true, output: `Simulated output from ${toolCallDetails.toolName}.` };
            conversationHistory.push({
                role: 'tool',
                toolCallId: toolCallDetails.toolCallId,
                toolName: toolCallDetails.toolName,
                content: JSON.stringify(toolResult)
            });
            currentStep = 'processing_llm_request_after_tool';
            job.updateJobData({ conversationHistory, currentStep });

            llmResponseText = `Simulated LLM response after ${toolCallDetails.toolName} execution.`;
            conversationHistory.push({ role: 'assistant', content: llmResponseText });
            currentStep = 'llm_response_complete';
            job.updateJobData({ conversationHistory, currentStep });
          }

          if (job.payload?.needsDelay) {
            job.updateJobData({ conversationHistory, currentStep: 'delay_requested' });
            job.prepareForDelay(new Date(Date.now() + (job.payload.delayDurationMs || 5000)));
            throw new DelayedError('Job execution requires a delay based on simulated condition.');
          }

          if (job.payload?.needsToWaitForChildren) {
            job.updateJobData({ conversationHistory, currentStep: 'waiting_for_children_requested' });
            job.prepareToWaitForChildren();
            throw new WaitingChildrenError('Job needs to wait for children based on simulated condition.');
          }

          console.log(`[AIAgentExecutionService] Job ${job.id} processing complete by agent ${agentProfile.name}. Final response: ${llmResponseText}`);
          return {
            finalOutput: llmResponseText,
            conversationHistory: job.props.data?.conversationHistory,
          };

        } catch (error) {
          if (error instanceof DelayedError || error instanceof WaitingChildrenError) {
            console.log(`[AIAgentExecutionService] Job ${job.id} threw ${error.name}. Propagating to worker.`);
            throw error;
          }
          const errorMessage = error instanceof Error ? error.message : 'Unknown error in AIAgentExecutionService.';
          console.error(`[AIAgentExecutionService] Unexpected error processing job ${job.id} for agent ${agentProfile.name}: ${errorMessage}`, error);
          job.fail(errorMessage);
          return { error: errorMessage };
        }
      }
    };
  }
}
