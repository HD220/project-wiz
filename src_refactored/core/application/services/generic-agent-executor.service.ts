import { Agent } from '@/refactored/core/domain/agent/agent.entity';
import { IAgentInternalStateRepository } from '@/refactored/core/domain/agent/ports/i-agent-internal-state.repository';
import { Job } from '@/refactored/core/domain/job/job.entity';
import { JobStatusType } from '@/refactored/core/domain/job/value-objects/job-status.vo';
import { AgentExecutorResult } from '@/refactored/core/domain/job/job-processing.types';
import { IJobRepository } from '@/refactored/core/domain/job/ports/i-job.repository';
// Corrected import: ok, error are named exports, Result is a type
import { ok, error, Result } from '@/refactored/shared/result';
import { DomainError, ToolError } from '@/refactored/core/common/errors';
import { HistoryEntryRoleType, ActivityHistoryEntry } from '@/refactored/core/domain/job/value-objects/activity-history-entry.vo';
import { ApplicationError } from '@/refactored/core/application/common/errors';
import { IToolExecutionContext } from '@/refactored/core/tools/tool.interface';
import { IAgentExecutor } from '@/refactored/core/application/ports/services/i-agent-executor.interface';
import { ILLMAdapter } from '@/refactored/core/application/ports/adapters/i-llm.adapter';
import { IToolRegistryService } from '@/refactored/core/application/ports/services/i-tool-registry.service';
import { ILogger } from '@/refactored/core/common/services/i-logger.service';
import { ActivityHistory } from '@/refactored/core/domain/job/value-objects/activity-history.vo';

// Define LanguageModelMessage (standard for Vercel AI SDK)
// TODO: Move to a shared types location if not already present
interface LanguageModelMessageToolCall {
  id: string;
  type: 'function'; // Currently, only 'function' is common
  function: {
    name: string;
    arguments: string; // JSON string
  };
}

interface LanguageModelMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string | null; // Content can be null, e.g., for assistant messages with only tool_calls
  tool_calls?: LanguageModelMessageToolCall[]; // For assistant role
  tool_call_id?: string; // For tool role
}


// @Injectable() // Assuming InversifyJS or similar will be used for DI
export class GenericAgentExecutor implements IAgentExecutor {
  constructor(
    private readonly llmAdapter: ILLMAdapter,
    private readonly toolRegistryService: IToolRegistryService,
    private readonly jobRepository: IJobRepository,
    private readonly agentInternalStateRepository: IAgentInternalStateRepository,
    private readonly logger: ILogger, // Added logger
  ) {}

  public async executeJob(
    job: Job,
    agent: Agent,
  ): Promise<Result<AgentExecutorResult, DomainError | ApplicationError>> {
    this.logger.info(
      `Executing Job ID: ${job.id.value} with Agent ID: ${agent.id.value}`,
      { jobId: job.id.value, agentId: agent.id.value },
    );

    try {
      // 1. Ensure AgentState and ActivityHistory are initialized
      let agentState = job.currentData().agentState;
      if (!agentState || !agentState.conversationHistory) {
        this.logger.info(
          `Job ID: ${job.id().value()} is missing agentState or conversationHistory. Initializing.`,
          { jobId: job.id().value() },
        );
        agentState = {
          conversationHistory: ActivityHistory.create([]),
          executionHistory: agentState?.executionHistory || [], // Preserve execution history if it exists
          // currentGoal: job.name().value(), // Optionally initialize currentGoal
        };
        job.updateAgentState(agentState);
        // Note: This modification to job should ideally be saved before proceeding,
        // or the job instance passed around should be the updated one.
        // For now, we assume jobRepository.save below will persist this if changed.
      }
      let currentActivityHistory = agentState.conversationHistory;


      // 2. Update Job status to PROCESSING (or ACTIVE)
      const jobStatusUpdateResult = this.updateJobToActiveStatus(job);
      if (jobStatusUpdateResult.isErr()) {
        return error(jobStatusUpdateResult.error);
      }

      // Save the job now that its state (potentially agentState and status) has been updated.
      const saveResult = await this.jobRepository.save(job);
      if (saveResult.isErr()) {
        this.logger.error(
          `Failed to save Job ID: ${job.id().value} after initial updates.`,
          saveResult.error,
          { jobId: job.id().value() },
        );
        return error(saveResult.error);
      }
      this.logger.info(`Job ID: ${job.id().value} is ACTIVE and saved. Attempt: ${job.attempts().value()}`, {
        jobId: job.id().value(),
        status: job.status().value(),
        attempts: job.attempts().value(),
      });

      // 3. Prepare for interaction loop
      let goalAchieved = false;
      let iterations = 0;
      const maxIterations = 5; // TODO: Make this configurable
      let llmResponseText = 'No response yet.'; // Holds the latest textual response from LLM
      let assistantMessage: LanguageModelMessage | null = null;


      // Ensure initial user prompt is in history if it was empty
      if (currentActivityHistory.isEmpty()) {
         const jobPayload = job.payload() as { prompt?: string; [key: string]: any };
         const jobName = job.name().value();
         const userPromptContent = jobPayload.prompt || `Based on your persona, please address the following task: ${jobName}`;
         const userPromptEntry = ActivityHistoryEntry.create(HistoryEntryRoleType.USER, userPromptContent);
         currentActivityHistory = currentActivityHistory.addEntry(userPromptEntry);
         agentState = {...agentState!, conversationHistory: currentActivityHistory};
         job.updateAgentState(agentState);
         // Note: a savepoint here might be good if the job is long-running.
      }


      // 4. Start interaction loop
      while (iterations < maxIterations && !goalAchieved) {
        iterations++;
        this.logger.info(`Starting LLM interaction cycle ${iterations} for Job ID: ${job.id().value()}`, { jobId: job.id().value(), iteration: iterations });

        // Construct messages for LLM from the current full history
        const persona = agent.personaTemplate();
        const systemMessageString = `You are ${persona.name().value()}, a ${persona.role().value()}. Your goal is: ${persona.goal().value()}. Persona backstory: ${persona.backstory().value()}`;
        conversationMessages = this.convertActivityHistoryToLlmMessages(systemMessageString, currentActivityHistory);

        this.logLlmCall(job, conversationMessages);

        const agentTemperature = agent.temperature();
        const llmGenerationResult = await this.llmAdapter.generateText(
            conversationMessages,
            { temperature: agentTemperature.value() }
        );

        if (llmGenerationResult.isErr()) {
          const llmError = llmGenerationResult.error;
          this.logger.error(`LLM generation failed in iteration ${iterations} for Job ID: ${job.id().value()}`, llmError, { jobId: job.id().value() });
          // Persist current state before returning error
          job.updateAgentState(agentState!); // agentState should be up-to-date
          await this.jobRepository.save(job);
          return error(new ApplicationError(`LLM generation failed: ${llmError.message}`));
        }

        assistantMessage = llmGenerationResult.value;
        llmResponseText = assistantMessage.content || '';
        this.logger.info(`LLM response (iteration ${iterations}) received for Job ID: ${job.id().value()}: ${llmResponseText.substring(0,100)}...`, { jobId: job.id().value() });

        const assistantHistoryEntry = ActivityHistoryEntry.create(
        HistoryEntryRoleType.ASSISTANT,
        assistantMessage.content, // This can be null if only tool_calls are present
        undefined, // timestamp will be set by create
        undefined, // toolName (not for assistant's own message)
        undefined, // toolCallId (not for assistant's own message)
        assistantMessage.tool_calls // Pass the tool_calls here
      );
      currentActivityHistory = currentActivityHistory.addEntry(assistantHistoryEntry);
      agentState = { // Ensure agentState is updated with the new history before processing tools
        ...agentState!,
        conversationHistory: currentActivityHistory,
        executionHistory: [...(agentState!.executionHistory || [])] // Ensure executionHistory is an array
      };
      job.updateAgentState(agentState);


      // Process tool_calls if present
      const newExecutionHistoryEntries: ExecutionHistoryEntry[] = [];
      const toolResultActivityEntries: ActivityHistoryEntry[] = [];

      if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
        this.logger.info(`LLM requested ${assistantMessage.tool_calls.length} tool calls for Job ID: ${job.id().value()}`, { jobId: job.id().value() });

        for (const toolCall of assistantMessage.tool_calls) {
          const executionEntry = await this.processAndValidateSingleToolCall(toolCall, job.id().value(), agent.id().value());
          newExecutionHistoryEntries.push(executionEntry);

          // Create ActivityHistoryEntry for the tool result
          let toolResultContent: string;
          if (executionEntry.type === 'tool_error') {
            // Serialize the error object for content, or use a summary
            toolResultContent = JSON.stringify(executionEntry.error || { message: 'Tool execution failed without details' });
             this.logger.warn(`Tool execution for '${executionEntry.name}' resulted in an error. Content for history: ${toolResultContent}`, {jobId: job.id().value()});
          } else {
            toolResultContent = JSON.stringify(executionEntry.result);
          }

          const toolResultActivityEntry = ActivityHistoryEntry.create(
            HistoryEntryRoleType.TOOL_RESULT,
            toolResultContent,
            undefined, // timestamp
            executionEntry.name, // tool name from execution entry
            toolCall.id          // IMPORTANT: tool_call_id from the original assistant message's tool_call
          );
          toolResultActivityEntries.push(toolResultActivityEntry);
        }

        // Update agentState with new execution history entries
        if (newExecutionHistoryEntries.length > 0) {
          agentState = {
            ...agentState!,
            executionHistory: [...agentState!.executionHistory, ...newExecutionHistoryEntries],
          };
          // Not updating conversationHistory here yet, will do it after adding toolResultActivityEntries
        }

        // Add all tool result activity entries to currentActivityHistory
        if (toolResultActivityEntries.length > 0) {
          for(const entry of toolResultActivityEntries) {
            currentActivityHistory = currentActivityHistory.addEntry(entry);
          }
           agentState = { // Re-assign to ensure agentState has the latest currentActivityHistory
            ...agentState!,
            conversationHistory: currentActivityHistory,
          };
        }
        job.updateAgentState(agentState); // Single update to agentState for this turn of tool processing
      } // End of if (assistantMessage.tool_calls)

      // Update goalAchieved based on the latest llmResponseText and if any tool calls were made
      goalAchieved = this.isGoalAchievedByLlmResponse(llmResponseText, assistantMessage?.tool_calls); // Optional chaining

      if (goalAchieved) {
        this.logger.info(`Goal achieved for Job ID: ${job.id().value()} in iteration ${iterations}.`);
        break; // Exit loop if goal is achieved
      }
      if (iterations >= maxIterations) {
        this.logger.info(`Max iterations reached for Job ID: ${job.id().value()}.`);
        // Goal not achieved, but loop terminates.
      }
    } // End of while loop

    // This is the normal exit point after the loop
    return this.createFinalResult(job, llmResponseText, goalAchieved);

  } catch (caughtError) { // This is the correct main catch block for the executeJob method
    const errorObject = caughtError instanceof Error ? caughtError : new Error(String(caughtError));
    this.logger.error(
      `Unhandled error during execution of Job ID: ${job.id().value()}.`, // Updated log message
      errorObject,
      { jobId: job.id().value() },
    );
    return error(
      new ApplicationError(
        `Unhandled error during execution: ${errorObject.message}`,
      ),
    );
  }
} // End of GenericAgentExecutor class (ensure this isn't the issue)

// Ensure helper methods are part of the class or correctly defined if static/outside

  private updateJobToActiveStatus(job: Job): Result<void, ApplicationError> {
    if (job.moveToActive()) {
      return ok(undefined);
    }
    // This case should be rare if job is fetched correctly by worker
    this.logger.warn(
      `Job ID: ${job.id().value} could not be moved to ACTIVE state. Current status: ${job.status().value()}`,
      { jobId: job.id().value(), currentStatus: job.status().value() },
    );
    // Depending on policy, might return error or try to proceed if already active.
    // For now, if it's not already active and cannot be moved, it's an issue.
    if (!job.status().is(JobStatusType.ACTIVE)) {
        return error(new ApplicationError(`Job ${job.id().value()} could not be set to ACTIVE.`));
    }
    return ok(undefined); // Already active, proceed.
  }

  // private constructInitialLlmMessagesAndUpdateHistory // This method is now obsolete and removed.

  private convertActivityHistoryToLlmMessages(
    systemMessageContent: string,
    history: ActivityHistory
  ): LanguageModelMessage[] {
    const messages: LanguageModelMessage[] = [{ role: 'system', content: systemMessageContent }];

    history.entries().forEach(entry => {
      const role = entry.role();
      const content = entry.content(); // Content is already a string (or empty string if was null)

      if (role === HistoryEntryRoleType.USER) {
        messages.push({ role: 'user', content });
      } else if (role === HistoryEntryRoleType.ASSISTANT) {
        messages.push({
          role: 'assistant',
          content: content, // content might be "" if original was null
          tool_calls: entry.props.tool_calls || undefined // Access via props as it's ReadonlyArray
        });
      } else if (role === HistoryEntryRoleType.TOOL_RESULT) {
        messages.push({
          role: 'tool',
          tool_call_id: entry.toolCallId(),
          // name: entry.toolName(), // Vercel SDK for 'tool' role might expect 'name' of the function.
                                  // For now, tool_call_id and content are primary.
                                  // If 'name' is needed, ActivityHistoryEntry or this mapping needs adjustment.
          content: content, // This is the stringified tool result/error
        });
      }
      // TOOL_CALL role from history is not directly sent back to LLM, only TOOL_RESULT
      // SYSTEM messages from history (other than the primary one) are also not typically re-added here unless a specific strategy requires it.
    });
    return messages;
  }

  private async processAndValidateSingleToolCall(
    toolCall: LanguageModelMessageToolCall,
    jobIdForLogging: string,
    agentIdForContext: string, // Added agentId
  ): Promise<ExecutionHistoryEntry> {
    const toolName = toolCall.function.name;
    const timestamp = new Date();

    const toolResult = await this.toolRegistryService.getTool(toolName);

    if (toolResult.isErr()) {
      const errorMsg = `Tool '${toolName}' not found. Error: ${toolResult.error.message}`;
      this.logger.error(errorMsg, toolResult.error, { jobId: jobIdForLogging, toolName });
      return { timestamp, type: 'tool_error', name: toolName, error: errorMsg };
    }
    const tool = toolResult.value;

    let parsedArgs: any;
    try {
      parsedArgs = JSON.parse(toolCall.function.arguments);
    } catch (parseError) {
      const errorMsg = `Failed to parse arguments for tool '${toolName}'. Error: ${(parseError as Error).message}`;
      this.logger.error(errorMsg, parseError as Error, { jobId: jobIdForLogging, toolName, args: toolCall.function.arguments });
      return { timestamp, type: 'tool_error', name: toolName, error: errorMsg, params: { originalArgs: toolCall.function.arguments } };
    }

    const validationResult = tool.parameters.safeParse(parsedArgs);
    if (!validationResult.success) {
      const errorMsg = `Argument validation failed for tool '${toolName}'.`;
      this.logger.error(errorMsg, validationResult.error.flatten(), { jobId: jobIdForLogging, toolName, issues: validationResult.error.flatten() });
      return { timestamp, type: 'tool_error', name: toolName, error: { message: errorMsg, issues: validationResult.error.flatten() }, params: parsedArgs };
    }

    this.logger.info(`Tool call validated: ${toolName} with args: ${JSON.stringify(validationResult.data)}`, { jobId: jobIdForLogging, toolName });

    // Execute the tool
    const executionContext: IToolExecutionContext = {
      agentId: agentIdForContext,
      jobId: jobIdForLogging,
      // projectId, userId could be added if available and needed by tools
    };

    try {
      const toolExecResult = await tool.execute(validationResult.data, executionContext);

      if (toolExecResult.isErr()) {
        const toolError = toolExecResult.error;
        this.logger.error(`Tool '${toolName}' execution failed for Job ID: ${jobIdForLogging}. Error: ${toolError.message}`, toolError);
        return {
          timestamp,
          type: 'tool_error',
          name: toolName,
          params: validationResult.data,
          error: { message: toolError.message, details: (toolError as any).details, stack: toolError.stack }
        };
      }

      // Success path
      this.logger.info(`Tool '${toolName}' executed successfully for Job ID: ${jobIdForLogging}`, { result: toolExecResult.value });
      return {
        timestamp,
        type: 'tool_call',
        name: toolName,
        params: validationResult.data,
        result: toolExecResult.value
      };

    } catch (execError) {
      const errorMsg = `Unexpected error during tool '${toolName}' execution: ${(execError as Error).message}`;
      this.logger.error(errorMsg, execError as Error, { jobId: jobIdForLogging, toolName });
      return { timestamp, type: 'tool_error', name: toolName, error: errorMsg, params: validationResult.data };
    }
  }

  private isGoalAchievedByLlmResponse(responseText: string, toolCalls?: LanguageModelMessageToolCall[]): boolean {
    // If there are tool calls, the goal is not yet achieved from this response alone.
    if (toolCalls && toolCalls.length > 0) {
      return false;
    }
    // Basic placeholder for goal achievement based on text content
    return responseText.toLowerCase().includes("task complete");
  }

  private logLlmCall(job: Job, messages: LanguageModelMessage[]): void {
    const jobIdVo = job.id();
    const attemptsVo = job.attempts();
    this.logger.info(`Calling LLM for Job ID: ${jobIdVo.value()}. Attempt ${attemptsVo.value()}`, {
      jobId: jobIdVo.value(),
      messages: messages.map(m => ({role: m.role, content: m.content.substring(0, 100) + '...'})),
    });
  }

  private createFinalResult(
    job: Job,
    llmResponseText: string,
    goalAchieved: boolean
  ): Result<AgentExecutorResult, DomainError | ApplicationError> {
    const finalAgentJobState = job.currentData().agentState || {
      conversationHistory: ActivityHistory.create([]),
      executionHistory: []
    };
    const jobIdVo = job.id();

    return ok<AgentExecutorResult, DomainError | ApplicationError>({
      jobId: jobIdVo.value(),
      status: goalAchieved ? 'COMPLETED_SUCCESS' : 'PENDING_LLM_RESPONSE',
      output: { message: llmResponseText },
      history: finalAgentJobState.conversationHistory.entries(),
      errors: [],
      nextAllowedToolCalls: null,
    });
  }
}
