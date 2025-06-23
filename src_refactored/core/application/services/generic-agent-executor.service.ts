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
  private readonly MIN_USABLE_LLM_RESPONSE_LENGTH = 10;
  private readonly MAX_REPLAN_ATTEMPTS_FOR_EMPTY_RESPONSE = 1;

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
      let llmResponseText = 'No response yet.';
      let assistantMessage: LanguageModelMessage | null = null;
      let replanAttemptsForEmptyResponse = 0;


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

        const persona = agent.personaTemplate(); // Define persona here for system message
        const systemMessageString = `You are ${persona.name().value()}, a ${persona.role().value()}. Your goal is: ${persona.goal().value()}. Persona backstory: ${persona.backstory().value()}`;
        let conversationMessages = this.convertActivityHistoryToLlmMessages(systemMessageString, currentActivityHistory);

        this.logLlmCall(job, conversationMessages);

        const agentTemperature = agent.temperature();
        const llmGenerationResult = await this.llmAdapter.generateText(
            conversationMessages,
            { temperature: agentTemperature.value() }
        );

        if (llmGenerationResult.isErr()) {
          const llmError = llmGenerationResult.error;
          const errorMessage = `LLM generation failed in iteration ${iterations} for Job ID: ${job.id().value()}. Error: ${llmError.message}`;
          this.logger.error(errorMessage, llmError, { jobId: job.id().value() });

          agentState = {
            ...agentState!,
            executionHistory: [...(agentState!.executionHistory || []), {
              timestamp: new Date(), type: 'llm_error', name: 'LLM Generation', error: llmError.message
            }]
          };
          job.updateAgentState(agentState);
          // Attempt to save job state on LLM error.
          try {
            await this.jobRepository.save(job);
          } catch (saveErr) {
            this.logger.error(`Failed to save job state during LLM error processing for Job ID: ${job.id().value()}`, saveErr);
          }
          return this.createFinalResult(job, 'FAILURE_LLM', errorMessage);
        }

        assistantMessage = llmGenerationResult.value;
        llmResponseText = assistantMessage.content || '';
        this.logger.info(`LLM response (iteration ${iterations}) received for Job ID: ${job.id().value()}: ${llmResponseText.substring(0,100)}...`, { jobId: job.id().value() });

        // Attempt re-plan for unusable LLM response
        const replanResult = this.attemptReplanForUnusableResponse(
          job,
          assistantMessage,
          llmResponseText,
          currentActivityHistory, // Pass current instead of agentState.conversationHistory
          agentState!, // Pass agentState for update
          replanAttemptsForEmptyResponse,
          iterations
        );

        if (replanResult.shouldReplan) {
          currentActivityHistory = replanResult.updatedHistory!;
          agentState = replanResult.updatedAgentState!;
          replanAttemptsForEmptyResponse = replanResult.newReplanAttemptCount!;
          continue; // Skip to next iteration
        }
        // If not replanning, proceed to add the original assistant message to history

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
      let criticalErrorEncounteredThisTurn = false;
      const newExecutionHistoryEntries: ExecutionHistoryEntry[] = [];
      const toolResultActivityEntries: ActivityHistoryEntry[] = [];

      if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
        this.logger.info(`LLM requested ${assistantMessage.tool_calls.length} tool calls for Job ID: ${job.id().value()}`, { jobId: job.id().value() });

        for (const toolCall of assistantMessage.tool_calls) {
          const executionEntry = await this.processAndValidateSingleToolCall(toolCall, job.id().value(), agent.id().value());
          newExecutionHistoryEntries.push(executionEntry);

          if (executionEntry.type === 'tool_error' && typeof executionEntry.error === 'string' && executionEntry.error.includes('Tool not found')) {
            criticalErrorEncounteredThisTurn = true;
            job.updateLastFailureSummary(`Critical: Tool '${executionEntry.name}' not found.`);
            this.logger.error(`Critical tool error for Job ID ${job.id().value()}: Tool '${executionEntry.name}' not found. Halting agent processing for this turn.`);
            // We will break out of the tool processing loop, then the main loop will terminate due to this.
          }

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

        if (criticalErrorEncounteredThisTurn) {
          goalAchieved = false; // Ensure goal is not marked as achieved
          break; // Break from the main while loop
        }
      } // End of if (assistantMessage.tool_calls)

      // Update goalAchieved based on the latest llmResponseText and if any tool calls were made
      // Only if no critical error forced an early exit from tool processing.
      if (!criticalErrorEncounteredThisTurn) {
        goalAchieved = this.isGoalAchievedByLlmResponse(llmResponseText, assistantMessage?.tool_calls);
      }


      if (goalAchieved) {
        this.logger.info(`Goal achieved for Job ID: ${job.id().value()} in iteration ${iterations}.`);
        break; // Exit loop if goal is achieved
      }
      if (iterations >= maxIterations) {
        this.logger.info(`Max iterations reached for Job ID: ${job.id().value()}.`);
      }
    } // End of while loop

    // Determine final status and message after loop
    let finalStatus: AgentExecutorStatus;
    let finalMessage: string;
    let finalOutput: any = undefined;

    // The criticalErrorEncounteredThisTurn flag is set if a tool_not_found error caused the loop to break.
    // hasCriticalToolErrorInLoop checks if any tool error occurred during the last iteration's tool processing.
    const hasToolErrorInLastProcessedBatch = newExecutionHistoryEntries.some(e => e.type === 'tool_error');

    if (goalAchieved) {
      finalStatus = 'SUCCESS';
      finalMessage = `Goal achieved. Last LLM response: ${llmResponseText}`;
      finalOutput = { message: llmResponseText };
      job.updateLastFailureSummary(undefined); // Clear any previous summary on success
    } else if (criticalErrorEncounteredThisTurn) { // This flag is set if loop broke due to critical tool error
      finalStatus = 'FAILURE_TOOL';
      // lastFailureSummary was already set when criticalErrorEncounteredThisTurn was set to true
      finalMessage = job.currentData().lastFailureSummary || `Processing stopped due to a critical tool error after ${iterations} iterations. Last LLM response: ${llmResponseText}`;
    } else if (iterations >= maxIterations) {
      finalStatus = 'FAILURE_MAX_ITERATIONS';
      finalMessage = `Max iterations (${maxIterations}) reached. Goal not achieved. Last LLM response: ${llmResponseText}`;
      job.updateLastFailureSummary(finalMessage);
    } else if (hasToolErrorInLastProcessedBatch) {
      // Loop ended (not by goal, not by max iterations), but last processed batch had tool errors.
      // This implies the LLM might not have had a chance to react to these tool errors if the loop broke for other reasons after tools ran.
      finalStatus = 'FAILURE_TOOL';
      const lastToolError = newExecutionHistoryEntries.find(e => e.type === 'tool_error') ||
                            agentState?.executionHistory.slice().reverse().find(e => e.type === 'tool_error'); // Fallback
      finalMessage = `Processing ended after ${iterations} iterations with unresolved tool errors. Last tool error: ${JSON.stringify(lastToolError?.error)}. Last LLM response: ${llmResponseText}`;
      job.updateLastFailureSummary(finalMessage);
    } else {
      // Default failure if loop terminates unexpectedly without achieving goal or hitting max iterations, and no specific error flagged.
      finalStatus = 'FAILURE_INTERNAL';
      finalMessage = `Processing stopped after ${iterations} iterations without explicit goal or max iterations. Last LLM response: ${llmResponseText}`;
      this.logger.warn(finalMessage, { jobId: job.id().value() });
      job.updateLastFailureSummary(finalMessage);
    }

    return this.createFinalResult(job, finalStatus, finalMessage, finalOutput);

  } catch (caughtError) {
    const errorObject = caughtError instanceof Error ? caughtError : new Error(String(caughtError));
    const internalErrorMessage = `Unhandled error during execution of Job ID: ${job.id().value()}. Error: ${errorObject.message}`;
    this.logger.error(internalErrorMessage, errorObject, { jobId: job.id().value() });

    let currentAgentStateForError = job.currentData().agentState;
    if (!currentAgentStateForError) {
        currentAgentStateForError = { conversationHistory: ActivityHistory.create([]), executionHistory: [] };
    }
    const updatedExecutionHistory = [...currentAgentStateForError.executionHistory, {
        timestamp: new Date(), type: 'system_error', name: 'UnhandledExecutorError', error: errorObject.message
    }];
    job.updateAgentState({
        ...currentAgentStateForError,
        executionHistory: updatedExecutionHistory
    });

    try {
      await this.jobRepository.save(job);
    } catch (saveErr) {
        this.logger.error(`Failed to save job state during unhandled error processing for Job ID: ${job.id().value()}`, saveErr);
    }
    return this.createFinalResult(job, 'FAILURE_INTERNAL', internalErrorMessage);
  }
}

  private updateJobToActiveStatus(job: Job): Result<void, ApplicationError> {
    if (job.moveToActive()) {
      return ok(undefined);
    }
    this.logger.warn(
      `Job ID: ${job.id().value} could not be moved to ACTIVE state. Current status: ${job.status().value()}`,
      { jobId: job.id().value(), currentStatus: job.status().value() },
    );
    if (!job.status().is(JobStatusType.ACTIVE)) {
        return error(new ApplicationError(`Job ${job.id().value()} could not be set to ACTIVE.`));
    }
    return ok(undefined);
  }

  private convertActivityHistoryToLlmMessages(
    systemMessageContent: string,
    history: ActivityHistory
  ): LanguageModelMessage[] {
    const messages: LanguageModelMessage[] = [{ role: 'system', content: systemMessageContent }];

    history.entries().forEach(entry => {
      const role = entry.role();
      const content = entry.content();

      if (role === HistoryEntryRoleType.USER) {
        messages.push({ role: 'user', content });
      } else if (role === HistoryEntryRoleType.ASSISTANT) {
        messages.push({
          role: 'assistant',
          content: content,
          tool_calls: entry.props.tool_calls || undefined
        });
      } else if (role === HistoryEntryRoleType.TOOL_RESULT) {
        messages.push({
          role: 'tool',
          tool_call_id: entry.toolCallId(),
          content: content,
        });
      }
    });
    return messages;
  }

  private async processAndValidateSingleToolCall(
    toolCall: LanguageModelMessageToolCall,
    jobIdForLogging: string,
    agentIdForContext: string,
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

    const executionContext: IToolExecutionContext = {
      agentId: agentIdForContext,
      jobId: jobIdForLogging,
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
    if (toolCalls && toolCalls.length > 0) {
      return false;
    }
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
    statusToSet: AgentExecutorStatus, // Use the new granular status type
    finalMessage: string,
    outputData?: any,
    // Pass execution history directly if needed, or rely on job.currentData()
    // For now, rely on job.currentData() to get the most up-to-date state.
  ): Result<AgentExecutorResult, DomainError | ApplicationError> {
    const agentState = job.currentData().agentState || {
      conversationHistory: ActivityHistory.create([]),
      executionHistory: []
    };
    const jobIdVo = job.id();

    // Filter execution history for actual errors to populate the 'errors' field
    const executionErrorEntries = agentState.executionHistory.filter(e => e.type.endsWith('_error'));

    return ok<AgentExecutorResult, DomainError | ApplicationError>({
      jobId: jobIdVo.value(),
      status: statusToSet,
      message: finalMessage,
      output: outputData,
      history: agentState.conversationHistory.entries(),
      errors: executionErrorEntries, // Populate with actual errors from execution
      nextAllowedToolCalls: null, // This might need to be determined by the last assistant message if status is not terminal
    });
  }
}
