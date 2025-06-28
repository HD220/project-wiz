// src_refactored/core/application/services/generic-agent-executor.service.ts
import { injectable, inject } from 'inversify';

import { ApplicationError } from '@/core/application/common/errors';
import { IAgentExecutor } from '@/core/application/ports/services/i-agent-executor.interface';
import { IToolRegistryService, TOOL_REGISTRY_SERVICE_TOKEN } from '@/core/application/ports/services/i-tool-registry.service';
import { ILoggerService, LoggerServiceToken } from '@/core/common/services/i-logger.service';
import { Agent } from '@/core/domain/agent/agent.entity';
import { IAgentRepository, AGENT_REPOSITORY_TOKEN } from '@/core/domain/agent/ports/agent-repository.interface';
import { DomainError, ToolError, ValueError } from '@/core/domain/common/errors';
import {
  AgentExecutorResult,
  CriticalToolFailureInfo,
  ExecutionHistoryEntry,
  AgentExecutorStatus,
  AgentExecutionPayload // New payload type
} from '@/core/domain/job/job-processing.types';
import { JobEntity } from '@/core/domain/job/job.entity';
import { ActivityHistoryEntry, HistoryEntryRoleType } from '@/core/domain/job/value-objects/activity-history-entry.vo';
import { ActivityHistory } from '@/core/domain/job/value-objects/activity-history.vo';
import { ILLMAdapter, ILLMAdapterToken } from '@/core/ports/adapters/llm-adapter.interface';
import { LanguageModelMessage, LanguageModelMessageToolCall } from '@/core/ports/adapters/llm-adapter.types';
import { IToolExecutionContext, IAgentTool } from '@/core/tools/tool.interface';

import { Result, ok, error } from '@/shared/result'; // Result might not be needed for return type if throwing errors

@injectable()
export class GenericAgentExecutor implements IAgentExecutor {
  private readonly minUsableLlmResponseLength = 10;
  private readonly maxReplanAttemptsForEmptyResponse = 1;

  constructor(
    @inject(ILLMAdapterToken) private readonly llmAdapter: ILLMAdapter,
    @inject(TOOL_REGISTRY_SERVICE_TOKEN) private readonly toolRegistryService: IToolRegistryService,
    @inject(AGENT_REPOSITORY_TOKEN) private readonly agentRepository: IAgentRepository,
    // IJobRepository removed
    // IAgentInternalStateRepository removed (assuming agent state is part of Agent entity or job payload for now)
    @inject(LoggerServiceToken) private readonly logger: ILoggerService,
  ) {}

  // Changed signature to be a ProcessorFunction for JobWorkerService
  public async process(
    job: JobEntity<AgentExecutionPayload, AgentExecutorResult> // JobEntity with specific payload
  ): Promise<AgentExecutorResult> { // Returns AgentExecutorResult directly, throws on critical failure
    const jobPayload = job.payload;
    const agentId = jobPayload.agentId;
    const jobId = job.id; // JobIdVO

    this.logger.info(
      `Processing Job ID: ${jobId.value} with Agent ID: ${agentId}`,
      { jobId: jobId.value, agentId: agentId },
    );

    const agentResult = await this.agentRepository.findById(AgentId.create(agentId)); // Assuming AgentId VO
    if (agentResult.isError() || !agentResult.value) {
      const message = `Agent with ID ${agentId} not found or error fetching.`;
      this.logger.error(message, agentResult.isError() ? agentResult.error : undefined);
      await job.addLogToExecution(message, 'ERROR');
      throw new ApplicationError(message); // Worker will catch this and fail the job
    }
    const agent = agentResult.value;

    // Initialize agentState from job if it exists, or create a new one.
    // The `agentState` now primarily means the conversation and execution history for this run.
    // Long-term agent memory/state is separate.
    let agentState = job.props.agentState || { // Accessing props directly for agentState is a temporary measure
      conversationHistory: ActivityHistory.create([]),
      executionHistory: [],
    };

    // Helper to update agentState on the job entity (in-memory)
    const updateJobAgentState = (newState: typeof agentState) => {
        job.props.agentState = newState; // This is a direct mutation, ideally use a method on JobEntity if it manages this
    };

    // Ensure conversation history is initialized
    if (!agentState.conversationHistory || agentState.conversationHistory.isEmpty()) {
      const userPromptContent = jobPayload.initialPrompt || `Based on your persona, please address the following task: ${job.jobName}`;
      const userPromptEntry = ActivityHistoryEntry.create(HistoryEntryRoleType.USER, userPromptContent);
      agentState.conversationHistory = ActivityHistory.create([userPromptEntry]);
      updateJobAgentState(agentState);
    }

    let currentActivityHistory = agentState.conversationHistory;

    // Job status is managed by JobWorkerService. Log current attempt.
    this.logger.info(`Job ID: ${jobId.value} processing attempt: ${job.attemptsMade}`);
    await job.updateProgress(10); // Example: initial progress

    let goalAchieved = false;
    let iterations = 0;
    const maxIterations = agent.maxIterations.value; // Assuming maxIterations is a VO
    this.logger.info(`Max iterations for Job ID: ${jobId.value} set to ${maxIterations}`);
    let llmResponseText = 'No response yet.';
    let assistantMessage: LanguageModelMessage | null = null;
    let replanAttemptsForEmptyResponse = 0;
    let criticalErrorEncounteredThisTurn = false;
    let newExecutionHistoryEntries: ExecutionHistoryEntry[] = [];

    while (iterations < maxIterations && !goalAchieved && !criticalErrorEncounteredThisTurn) {
      iterations++;
      this.logger.info(`Starting LLM interaction cycle ${iterations} for Job ID: ${jobId.value}`);
      await job.updateProgress(10 + (80 * iterations / maxIterations)); // Update progress

      const persona = agent.personaTemplate; // Assuming personaTemplate is a property
      const systemMessageString = `You are ${persona.name.value}, a ${persona.role.value}. Your goal is: ${persona.goal.value}. Persona backstory: ${persona.backstory.value()}`;
      const conversationMessages = this._convertActivityHistoryToLlmMessages(systemMessageString, currentActivityHistory);

      this._logLlmCall(jobId.value, job.attemptsMade, conversationMessages);
      await job.addLogToExecution(`Calling LLM (iteration ${iterations})`, 'DEBUG', {
        messages: conversationMessages.map(m => ({ role: m.role, content: m.content ? m.content.substring(0, 50) + '...' : null}))
      });


      const llmGenerationResult = await this.llmAdapter.generateText(
        conversationMessages,
        { temperature: agent.temperature.value }, // Assuming temperature is a VO
      );

      if (llmGenerationResult.isError()) {
        const llmError = llmGenerationResult.error;
        const errorMessage = `LLM generation failed in iteration ${iterations}. Error: ${llmError.message}`;
        this.logger.error(errorMessage, llmError, { jobId: jobId.value });
        agentState.executionHistory.push({ timestamp: new Date(), type: 'llm_error', name: 'LLM Generation', error: llmError.message });
        updateJobAgentState(agentState);
        // Throw an error that JobWorkerService will catch to fail the job
        throw new ApplicationError(errorMessage, llmError);
      }

      assistantMessage = llmGenerationResult.value;
      llmResponseText = assistantMessage.content || '';
      this.logger.info(`LLM response (iteration ${iterations}) for Job ID: ${jobId.value}: ${llmResponseText.substring(0, 100)}...`);
      await job.addLogToExecution(`LLM Response (iteration ${iterations}): ${llmResponseText.substring(0,100)}...`, 'DEBUG');


      const replanResult = this._attemptReplanForUnusableResponse(
        jobId.value, assistantMessage, llmResponseText, currentActivityHistory, agentState,
        replanAttemptsForEmptyResponse
      );

      if (replanResult.shouldReplan) {
        currentActivityHistory = replanResult.updatedHistory!;
        agentState = replanResult.updatedAgentState!;
        replanAttemptsForEmptyResponse = replanResult.newReplanAttemptCount!;
        updateJobAgentState(agentState);
        await job.addLogToExecution(`LLM response was unusable. Re-planning (attempt ${replanAttemptsForEmptyResponse}).`, 'WARN');
        continue;
      }

      const assistantHistoryEntry = ActivityHistoryEntry.create(
        HistoryEntryRoleType.ASSISTANT, assistantMessage.content, undefined, undefined, undefined, assistantMessage.tool_calls as LanguageModelMessageToolCall[] | undefined, // Cast needed if type differs
      );
      currentActivityHistory = currentActivityHistory.addEntry(assistantHistoryEntry);
      agentState.conversationHistory = currentActivityHistory;
      updateJobAgentState(agentState);


      newExecutionHistoryEntries = [];
      const toolResultActivityEntries: ActivityHistoryEntry[] = [];

      if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
        this.logger.info(`LLM requested ${assistantMessage.tool_calls.length} tool calls for Job ID: ${jobId.value}`);
        await job.addLogToExecution(`LLM requesting ${assistantMessage.tool_calls.length} tool calls.`, 'DEBUG');

        for (const toolCall of assistantMessage.tool_calls) {
          const executionContext: IToolExecutionContext = { agentId: agent.id.value, jobId: jobId.value, userId: jobPayload.userId };
          const executionEntry = await this._processAndValidateSingleToolCall(toolCall, executionContext);
          newExecutionHistoryEntries.push(executionEntry);

          if (executionEntry.type === 'tool_error' && executionEntry.error instanceof ToolError) {
            const toolError = executionEntry.error;
            await job.addLogToExecution(`Tool '${toolError.toolName || executionEntry.name}' error: ${toolError.message}`, 'ERROR', { isRecoverable: toolError.isRecoverable });
            if (!toolError.isRecoverable) {
              criticalErrorEncounteredThisTurn = true;
              // Store critical failure info on the job if needed (JobEntity might need a method for this)
              // job.setCriticalToolFailureInfo(...);
              this.logger.error(`Critical tool error for Job ID ${jobId.value}: Tool '${toolError.toolName || executionEntry.name}' failed non-recoverably.`, toolError);
              break;
            }
          }
          let toolResultContent: string;
          if (executionEntry.type === 'tool_error' && executionEntry.error) {
            const errDetails = executionEntry.error instanceof ToolError ?
              { name: executionEntry.error.name, message: executionEntry.error.message, toolName: executionEntry.error.toolName, isRecoverable: executionEntry.error.isRecoverable } :
              { message: String(executionEntry.error) };
            toolResultContent = JSON.stringify(errDetails);
          } else {
            toolResultContent = JSON.stringify(executionEntry.result);
          }
          const toolResultActivityEntry = ActivityHistoryEntry.create(HistoryEntryRoleType.TOOL_RESULT, toolResultContent, undefined, executionEntry.name, toolCall.id);
          toolResultActivityEntries.push(toolResultActivityEntry);
        }

        if (newExecutionHistoryEntries.length > 0) {
          agentState.executionHistory = [...(agentState.executionHistory || []), ...newExecutionHistoryEntries];
        }
        if (toolResultActivityEntries.length > 0) {
          for (const entry of toolResultActivityEntries) { currentActivityHistory = currentActivityHistory.addEntry(entry); }
          agentState.conversationHistory = currentActivityHistory;
        }
        updateJobAgentState(agentState);
        if (criticalErrorEncounteredThisTurn) break;
      }

      if (!criticalErrorEncounteredThisTurn) {
        goalAchieved = this._isGoalAchievedByLlmResponse(llmResponseText, assistantMessage?.tool_calls as LanguageModelMessageToolCall[] | undefined);
      }

      if (goalAchieved) { this.logger.info(`Goal achieved for Job ID: ${jobId.value} in iteration ${iterations}.`); break; }
      if (iterations >= maxIterations) { this.logger.info(`Max iterations reached for Job ID: ${jobId.value}.`); }
    } // End of while loop

    // Construct the final result
    let finalStatus: AgentExecutorStatus;
    let finalMessage: string;
    let finalOutput: unknown = undefined;

    if (goalAchieved) {
      finalStatus = 'SUCCESS';
      finalMessage = `Goal achieved. Last LLM response: ${llmResponseText}`;
      finalOutput = { message: llmResponseText, history: currentActivityHistory.entries() }; // Example output
      await job.updateProgress(100);
    } else if (criticalErrorEncounteredThisTurn) {
      const lastErrorEntry = agentState.executionHistory.slice().reverse().find(e => e.type.endsWith('_error'));
      finalStatus = lastErrorEntry?.type === 'llm_error' ? 'FAILURE_LLM' : 'FAILURE_TOOL';
      finalMessage = `Processing stopped due to a critical error after ${iterations} iterations. Error: ${lastErrorEntry?.error ? String(lastErrorEntry.error) : 'Unknown critical error'}`;
      await job.addLogToExecution(finalMessage, 'ERROR');
      throw new ApplicationError(finalMessage); // Let JobWorkerService handle job state
    } else if (iterations >= maxIterations) {
      finalStatus = 'FAILURE_MAX_ITERATIONS';
      finalMessage = `Max iterations (${maxIterations}) reached. Goal not achieved. Last LLM response: ${llmResponseText}`;
      await job.addLogToExecution(finalMessage, 'WARN');
      throw new ApplicationError(finalMessage); // Let JobWorkerService handle job state
    } else { // Should not be reached if loop terminates due to goal, error, or max_iterations
      finalStatus = 'FAILURE_INTERNAL';
      finalMessage = `Processing stopped unexpectedly after ${iterations} iterations. Last LLM response: ${llmResponseText}`;
      this.logger.warn(finalMessage, { jobId: jobId.value });
      await job.addLogToExecution(finalMessage, 'ERROR');
      throw new ApplicationError(finalMessage);
    }

    // Persist any final progress/logs before returning
    // This save is important if progress/logs were updated but not yet saved by an async call within the loop.
    if(job.props._repository) { // Check if active context is still set (it should be)
        await job.props._repository.save(job);
    }


    return {
      jobId: jobId.value,
      status: finalStatus,
      message: finalMessage,
      output: finalOutput,
      history: currentActivityHistory.entries(),
      errors: agentState.executionHistory.filter(e => e.type.endsWith('_error')),
    };
  }

  private _convertActivityHistoryToLlmMessages(systemMessageContent: string, history: ActivityHistory): LanguageModelMessage[] {
    const messages: LanguageModelMessage[] = [{ role: 'system', content: systemMessageContent }];
    history.entries().forEach(entry => {
      const role = entry.role();
      const content = entry.content();
      const toolCalls = entry.props.tool_calls as LanguageModelMessageToolCall[] | undefined; // Cast if necessary
      const toolCallId = entry.toolCallId();

      if (role === HistoryEntryRoleType.USER) {
        messages.push({ role: 'user', content });
      } else if (role === HistoryEntryRoleType.ASSISTANT) {
        messages.push({ role: 'assistant', content, tool_calls: toolCalls });
      } else if (role === HistoryEntryRoleType.TOOL_RESULT) {
        if (toolCallId) { // Ensure toolCallId exists for tool role messages
            messages.push({ role: 'tool', tool_call_id: toolCallId, content });
        } else {
            this.logger.warn("Tool result entry missing toolCallId, skipping conversion to LLM message.");
        }
      }
    });
    return messages;
  }

  private async _processAndValidateSingleToolCall(
    toolCall: LanguageModelMessageToolCall,
    executionContext: IToolExecutionContext
  ): Promise<ExecutionHistoryEntry> {
    const toolName = toolCall.function.name;
    const timestamp = new Date();

    const toolResult = this.toolRegistryService.getTool(toolName); // getTool is synchronous

    if (!toolResult) { // Assuming getTool returns undefined if not found
      const toolNotFoundError = new ToolError(`Tool '${toolName}' not found.`, toolName, undefined, false);
      this.logger.error(toolNotFoundError.message, { toolName, jobId: executionContext.jobId });
      return { timestamp, type: 'tool_error', name: toolName, error: toolNotFoundError, isCritical: true };
    }
    const tool = toolResult; // tool is IAgentTool

    let parsedArgs: unknown;
    try {
      parsedArgs = JSON.parse(toolCall.function.arguments);
    } catch (error: unknown) {
      const parseError = error instanceof Error ? error : new Error(String(error));
      const parsingToolError = new ToolError(`Failed to parse arguments for tool '${toolName}'. Error: ${parseError.message}`, toolName, parseError, true);
      this.logger.error(parsingToolError.message, { toolName, args: toolCall.function.arguments, jobId: executionContext.jobId });
      return { timestamp, type: 'tool_error', name: toolName, error: parsingToolError, params: { originalArgs: toolCall.function.arguments } };
    }

    const validationResult = tool.parameters.safeParse(parsedArgs);
    if (!validationResult.success) {
      const validationToolError = new ToolError(`Argument validation failed for tool '${toolName}'.`, toolName, validationResult.error, true);
      this.logger.error(validationToolError.message, { toolName, issues: validationResult.error.flatten(), jobId: executionContext.jobId });
      return { timestamp, type: 'tool_error', name: toolName, error: validationToolError, params: parsedArgs, isCritical: false };
    }

    this.logger.info(`Tool call validated: ${toolName} with args: ${JSON.stringify(validationResult.data)}`, { toolName, jobId: executionContext.jobId });

    try {
      const toolExecResult = await tool.execute(validationResult.data, executionContext);
      if (toolExecResult.isError()) {
        const toolErrorFromTool = toolExecResult.error;
        this.logger.error(`Tool '${toolName}' execution failed: ${toolErrorFromTool.message}`, { toolError: toolErrorFromTool, jobId: executionContext.jobId });
        return { timestamp, type: 'tool_error', name: toolName, params: validationResult.data, error: toolErrorFromTool, isCritical: !toolErrorFromTool.isRecoverable };
      }
      this.logger.info(`Tool '${toolName}' executed successfully.`, { result: toolExecResult.value, jobId: executionContext.jobId });
      return { timestamp, type: 'tool_call', name: toolName, params: validationResult.data, result: toolExecResult.value };
    } catch (error: unknown) {
      const execError = error instanceof Error ? error : new Error(String(error));
      const unexpectedToolError = new ToolError(`Unexpected error during tool '${toolName}' execution: ${execError.message}`, toolName, execError, false); // Typically non-recoverable
      this.logger.error(unexpectedToolError.message, { error: unexpectedToolError, jobId: executionContext.jobId });
      return { timestamp, type: 'tool_error', name: toolName, error: unexpectedToolError, params: validationResult.data, isCritical: true };
    }
  }

  private _isGoalAchievedByLlmResponse(responseText: string, toolCalls?: LanguageModelMessageToolCall[]): boolean {
    if (toolCalls && toolCalls.length > 0) return false; // If tools are called, goal is likely not yet achieved by text.
    return responseText.toLowerCase().includes('task complete'); // Simple keyword check
  }

  private _logLlmCall(jobId: string, attempt: number, messages: LanguageModelMessage[]): void {
    this.logger.info(`Calling LLM for Job ID: ${jobId}. Attempt ${attempt}`, {
      jobId: jobId,
      messages: messages.map(m => ({ role: m.role, content: m.content ? m.content.substring(0, 100) + '...' : null, tool_calls: m.tool_calls })),
    });
  }

  // This method is no longer part of this service's responsibility.
  // JobWorkerService handles final job state.
  // private _createFinalResult(job: JobEntity<AgentExecutionPayload, AgentExecutorResult>, statusToSet: AgentExecutorStatus, finalMessage: string, outputData?: unknown): AgentExecutorResult { ... }


  private _attemptReplanForUnusableResponse(
    jobId: string, // Changed job to jobId for logging context
    assistantMessage: LanguageModelMessage,
    llmResponseText: string,
    currentActivityHistory: ActivityHistory,
    currentAgentState: NonNullable<JobEntity<AgentExecutionPayload, AgentExecutorResult>['props']['agentState']>, // Type for agentState
    replanAttempts: number,
  ): {
    shouldReplan: boolean;
    updatedHistory?: ActivityHistory;
    updatedAgentState?: NonNullable<JobEntity<AgentExecutionPayload, AgentExecutorResult>['props']['agentState']>;
    newReplanAttemptCount?: number;
  } {
    if ((!llmResponseText || llmResponseText.length < this.minUsableLlmResponseLength) && (!assistantMessage.tool_calls || assistantMessage.tool_calls.length === 0)) {
      if (replanAttempts < this.maxReplanAttemptsForEmptyResponse) {
        this.logger.warn(`LLM response for Job ID ${jobId} was empty/too short. Attempting re-plan (${replanAttempts + 1}/${this.maxReplanAttemptsForEmptyResponse})`);
        const systemNote = ActivityHistoryEntry.create(HistoryEntryRoleType.USER, `System Note: Your previous response was empty or too short (received: "${llmResponseText}"). Please provide a more detailed response or use a tool.`);
        const updatedHistory = currentActivityHistory.addEntry(systemNote);
        const updatedAgentState = { ...currentAgentState, conversationHistory: updatedHistory, executionHistory: [...currentAgentState.executionHistory, { timestamp: new Date(), type: 'unusable_llm_response' as ExecutionHistoryEntry['type'], name: 'LLM Replan Trigger', error: `Empty/short response: ${llmResponseText}` }] };
        return { shouldReplan: true, updatedHistory, updatedAgentState, newReplanAttemptCount: replanAttempts + 1 };
      }
      this.logger.warn(`LLM response for Job ID ${jobId} was empty/too short after ${replanAttempts} re-plan attempts. Proceeding with this response.`);
    }
    return { shouldReplan: false, newReplanAttemptCount: replanAttempts };
  }
}
