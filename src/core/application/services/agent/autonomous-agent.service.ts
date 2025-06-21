import { Job } from '@/core/domain/entities/job';
import { AgentInternalState, AgentId } from '@/core/domain/entities/agent';
import { ActivityContext, ActivityHistoryEntry } from '@/core/domain/entities/job/value-objects';
import { IAgentServiceFacade } from '../../ports/agent-service-facade.interface';
import { ILLMAdapter, LLMAgentDecision } from '../../ports/llm-adapter.interface';
import { IAgentStateRepository } from '../../ports/agent-state-repository.interface';
import { ProcessActivityResult } from './autonomous-agent.types';
import { TaskResult } from '../../ports/task.interface';
// import { SystemClock } from '@/core/common/services/system-clock.interface'; // Assuming a clock port/service

// Simple in-memory Clock for now if dedicated service isn't created yet
// const defaultSystemClock: SystemClock = { now: () => new Date() };


export class AutonomousAgent {
  constructor(
    private readonly agentServiceFacade: IAgentServiceFacade,
    private readonly llmAdapter: ILLMAdapter,
    private readonly agentStateRepository: IAgentStateRepository, // To save updated AgentInternalState
    // private readonly systemClock: SystemClock = defaultSystemClock
  ) {}

  public async processActivity(
    job: Job, // Contains current ActivityContext in job.data
    agentInternalState: AgentInternalState
  ): Promise<ProcessActivityResult> {

    let currentContext = job.data; // ActivityContext from the Job
    const agentId = agentInternalState.agentId;

    try {
      // 1. Add entry for starting this processing step (optional, could be done by caller)
      // currentContext = this.addHistory(currentContext, 'agent', 'Starting processing step.');

      // 2. Call LLM to decide next action (Core agent loop logic will go here)
      // For now, a placeholder decision
      const decision: LLMAgentDecision = await this.llmAdapter.generateAgentDecision(
        currentContext,
        agentInternalState
        // TODO: Pass available tools schema to LLM
      );

      // currentContext = this.addHistory(currentContext, 'agent', `LLM Decision: ${decision.thought || 'No thought.'} Next Task: ${decision.nextTask || 'None'}`);

      if (decision.isFinalAnswer) {
        // currentContext = this.addHistory(currentContext, 'agent', `Final answer provided: ${decision.outputForUser || 'Done.'}`);
        return {
          status: 'completed',
          newContext: currentContext,
          output: { message: decision.outputForUser || "Activity complete." },
        };
      }

      if (decision.nextTask) {
        // 3. If LLM decides on a task, execute it
        const taskResult: TaskResult = await this.agentServiceFacade.executeTask(
          decision.nextTask,
          currentContext, // Pass current context to the task
            decision.taskParameters, // Pass the parameters from LLM decision
          agentId.getValue()
        );

        // Update context with task result
        currentContext = taskResult.nextActivityContext || currentContext;
        // currentContext = this.addHistory(currentContext, 'tool', `Task ${decision.nextTask} executed. Success: ${taskResult.success}. Output: ${JSON.stringify(taskResult.output || {})}`);

        if (!taskResult.success) {
          // currentContext = this.addHistory(currentContext, 'agent', `Task ${decision.nextTask} failed: ${taskResult.error}`);
          return {
            status: 'failed', // Or could be 'in_progress' if retryable within agent
            newContext: currentContext,
            error: taskResult.error || `Task ${decision.nextTask} failed.`,
          };
        }

        // If task successful, loop back to LLM or decide further (simplified for now)
        // For this initial version, assume one task execution per processActivity call
        return {
          status: 'in_progress', // Or completed if taskResult indicates final step
          newContext: currentContext,
          output: taskResult.output,
        };
      }

      // 4. If no task, but not final answer, maybe just a thought or waiting
      // currentContext = this.addHistory(currentContext, 'agent', 'No specific task to execute, continuing or waiting for next trigger.');
      return {
        status: 'in_progress', // Or a more specific status
        newContext: currentContext,
        output: { message: decision.thought || "Processing..." }
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      // currentContext = this.addHistory(currentContext, 'system', `Error in AutonomousAgent: ${errorMessage}`);
      return {
        status: 'failed',
        newContext: currentContext,
        error: errorMessage,
      };
    }
  }

  // Helper to add to history (example, can be more sophisticated)
  // private addHistory(context: ActivityContext, actor: 'user'|'agent'|'system'|'tool', message: string): ActivityContext {
  //   const newEntry = ActivityHistoryEntry.create({
  //       timestamp: this.systemClock.now(), // systemClock would need to be uncommented
  //       actor: actor,
  //       message: message,
  //   });
  //   return context.updateHistory(context.getHistory().addEntry(newEntry));
  // }
}
