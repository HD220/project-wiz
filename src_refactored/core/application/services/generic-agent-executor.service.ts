
import { ILogger } from '@/core/common/services/i-logger.service';
// Corrected path for ILLMAdapter, was trying to import from @/application before
import { AgentExecutorStatus } from '@/core/domain/job/job-processing.types'; // Added import
import { ILLMAdapter } from '@/core/ports/adapters/llm-adapter.interface';
import { LanguageModelMessage, LanguageModelMessageToolCall } from '@/core/ports/adapters/llm-adapter.types'; // Assuming this path
import { IToolExecutionContext } from '@/core/tools/tool.interface';

import { Agent } from '@/domain/agent/agent.entity';
// Corrected filename for IAgentInternalStateRepository
import { IAgentInternalStateRepository } from '@/domain/agent/ports/agent-internal-state-repository.interface';
import { DomainError, ToolError } from '@/domain/common/errors';
import { AgentExecutorResult, CriticalToolFailureInfo, ExecutionHistoryEntry } from '@/domain/job/job-processing.types';
import { Job } from '@/domain/job/job.entity';
// Corrected filename for IJobRepository
import { IJobRepository } from '@/domain/job/ports/job-repository.interface';
import { ActivityHistoryEntry, HistoryEntryRoleType } from '@/domain/job/value-objects/activity-history-entry.vo';
import { ActivityHistory } from '@/domain/job/value-objects/activity-history.vo';
import { JobStatusType } from '@/domain/job/value-objects/job-status.vo';

import { ApplicationError } from '@/application/common/errors';
import { IAgentExecutor } from '@/application/ports/services/i-agent-executor.interface';
import { IToolRegistryService } from '@/application/ports/services/i-tool-registry.service';

import { ok, error, Result } from '@/shared/result';


// @Injectable() // Assuming InversifyJS or similar will be used for DI
export class GenericAgentExecutor implements IAgentExecutor {
  private readonly minUsableLlmResponseLength = 10;
  private readonly maxReplanAttemptsForEmptyResponse = 1;

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
    const { id: jobId, attemptsMade } = job.props; // Assuming props access like this
    this.logger.info(
      `Executing Job ID: ${jobId.value} with Agent ID: ${agent.id.value}`,
      { jobId: jobId.value, agentId: agent.id.value },
    );

    let agentExecutorResult: AgentExecutorResult;

    try {
      let agentState = job.currentData().agentState;
      if (!agentState || !agentState.conversationHistory) {
        this.logger.info(`Job ID: ${jobId.value} is missing agentState or conversationHistory. Initializing.`);
        agentState = {
          conversationHistory: ActivityHistory.create([]),
          executionHistory: agentState?.executionHistory || [],
        };
        job.updateAgentState(agentState);
      }
      let currentActivityHistory = agentState.conversationHistory;

      const jobStatusUpdateResult = this.updateJobToActiveStatus(job);
      if (jobStatusUpdateResult.isErr()) {
        agentExecutorResult = this._createFinalResult(job, 'FAILURE_INTERNAL', jobStatusUpdateResult.error.message);
        job.finalizeExecution(agentExecutorResult);
        await this.jobRepository.save(job).catch(saveErr => this.logger.error(`Failed to save job during status update failure for Job ID: ${jobId.value}`, saveErr));
        return error(jobStatusUpdateResult.error);
      }

      const initialSaveResult = await this.jobRepository.save(job);
      if (initialSaveResult.isErr()) {
        this.logger.error(`Failed to save Job ID: ${jobId.value} after initial updates.`, initialSaveResult.error);
        agentExecutorResult = this._createFinalResult(job, 'FAILURE_INTERNAL', `Initial save failed: ${initialSaveResult.error.message}`);
        job.finalizeExecution(agentExecutorResult);
        await this.jobRepository.save(job).catch(saveErr => this.logger.error(`Failed to save job during initial save failure processing for Job ID: ${jobId.value}`, saveErr));
        return error(initialSaveResult.error);
      }
      this.logger.info(`Job ID: ${jobId.value} is ACTIVE and saved. Attempt: ${attemptsMade.value}`);

      let goalAchieved = false;
      let iterations = 0;
      const maxIterations = agent.maxIterations().value;
      this.logger.info(`Max iterations for Job ID: ${jobId.value} set to ${maxIterations} from agent config.`);
      let llmResponseText = 'No response yet.';
      let assistantMessage: LanguageModelMessage | null = null;
      let replanAttemptsForEmptyResponse = 0;
      let criticalErrorEncounteredThisTurn = false;
      let newExecutionHistoryEntries: ExecutionHistoryEntry[] = [];

      if (currentActivityHistory.isEmpty()) {
        const jobPayload = job.payload() as { prompt?: string; [key: string]: unknown };
        const jobName = job.name().value;
        const userPromptContent = jobPayload.prompt || `Based on your persona, please address the following task: ${jobName}`;
        const userPromptEntry = ActivityHistoryEntry.create(HistoryEntryRoleType.USER, userPromptContent);
        currentActivityHistory = currentActivityHistory.addEntry(userPromptEntry);
        agentState = { ...agentState!, conversationHistory: currentActivityHistory };
        job.updateAgentState(agentState);
      }

      while (iterations < maxIterations && !goalAchieved && !criticalErrorEncounteredThisTurn) {
        iterations++;
        this.logger.info(`Starting LLM interaction cycle ${iterations} for Job ID: ${jobId.value}`);

        const persona = agent.personaTemplate();
        const systemMessageString = `You are ${persona.name().value}, a ${persona.role().value}. Your goal is: ${persona.goal().value}. Persona backstory: ${persona.backstory().value()}`;
        const conversationMessages = this._convertActivityHistoryToLlmMessages(systemMessageString, currentActivityHistory);

        this._logLlmCall(job, conversationMessages);

        const agentTemperature = agent.temperature();
        const llmGenerationResult = await this.llmAdapter.generateText(
          conversationMessages,
          { temperature: agentTemperature.value() },
        );

        if (llmGenerationResult.isErr()) {
          const llmError = llmGenerationResult.error;
          const errorMessage = `LLM generation failed in iteration ${iterations} for Job ID: ${jobId.value}. Error: ${llmError.message}`;
          this.logger.error(errorMessage, llmError);
          agentState = {
            ...agentState!,
            executionHistory: [...(agentState!.executionHistory || []), {
              timestamp: new Date(), type: 'llm_error', name: 'LLM Generation', error: llmError.message,
            }],
          };
          job.updateAgentState(agentState);
          agentExecutorResult = this._createFinalResult(job, 'FAILURE_LLM', errorMessage);
          criticalErrorEncounteredThisTurn = true;
          break;
        }

        assistantMessage = llmGenerationResult.value;
        llmResponseText = assistantMessage.content || '';
        this.logger.info(`LLM response (iteration ${iterations}) received for Job ID: ${jobId.value}: ${llmResponseText.substring(0, 100)}...`);

        const replanResult = this._attemptReplanForUnusableResponse(
          job, assistantMessage, llmResponseText, currentActivityHistory, agentState!,
          replanAttemptsForEmptyResponse, iterations,
        );

        if (replanResult.shouldReplan) {
          currentActivityHistory = replanResult.updatedHistory!;
          agentState = replanResult.updatedAgentState!;
          replanAttemptsForEmptyResponse = replanResult.newReplanAttemptCount!;
          job.updateAgentState(agentState);
          continue;
        }

        const assistantHistoryEntry = ActivityHistoryEntry.create(
          HistoryEntryRoleType.ASSISTANT, assistantMessage.content, undefined, undefined, undefined, assistantMessage.tool_calls,
        );
        currentActivityHistory = currentActivityHistory.addEntry(assistantHistoryEntry);
        agentState = { ...agentState!, conversationHistory: currentActivityHistory, executionHistory: [...(agentState!.executionHistory || [])] };
        job.updateAgentState(agentState);

        newExecutionHistoryEntries = [];
        const toolResultActivityEntries: ActivityHistoryEntry[] = [];

        if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
          this.logger.info(`LLM requested ${assistantMessage.tool_calls.length} tool calls for Job ID: ${jobId.value}`);
          for (const toolCall of assistantMessage.tool_calls) {
            const executionEntry = await this._processAndValidateSingleToolCall(toolCall, jobId.value, agent.id.value);
            newExecutionHistoryEntries.push(executionEntry);

            if (executionEntry.type === 'tool_error' && executionEntry.error instanceof ToolError) {
              const toolError = executionEntry.error;
              if (!toolError.isRecoverable) {
                criticalErrorEncounteredThisTurn = true;
                const failureInfo: CriticalToolFailureInfo = {
                  toolName: toolError.toolName || executionEntry.name,
                  errorType: toolError.name,
                  message: toolError.message,
                  details: toolError.originalError ? {
                    name: (toolError.originalError as Error).name,
                    message: (toolError.originalError as Error).message,
                    stack: (toolError.originalError as Error).stack?.substring(0, 500),
                  } : undefined,
                  isRecoverable: false,
                };
                job.setCriticalToolFailureInfo(failureInfo);
                job.updateLastFailureSummary(`Critical: Tool '${failureInfo.toolName}' failed non-recoverably: ${failureInfo.message}`);
                this.logger.error(`Critical tool error for Job ID ${jobId.value}: Tool '${failureInfo.toolName}' failed non-recoverably. Details: ${JSON.stringify(failureInfo)}`, toolError);
                break;
              }
            }
            let toolResultContent: string;
            if (executionEntry.type === 'tool_error' && executionEntry.error instanceof ToolError) {
              toolResultContent = JSON.stringify({
                name: executionEntry.error.name,
                message: executionEntry.error.message,
                toolName: executionEntry.error.toolName,
                isRecoverable: executionEntry.error.isRecoverable,
                originalError: executionEntry.error.originalError ? {
                  name: (executionEntry.error.originalError as Error).name,
                  message: (executionEntry.error.originalError as Error).message,
                } : undefined,
              });
            } else if (executionEntry.type === 'tool_error') {
              toolResultContent = JSON.stringify(executionEntry.error || { message: 'Tool execution failed without details' });
            } else {
              toolResultContent = JSON.stringify(executionEntry.result);
            }
            const toolResultActivityEntry = ActivityHistoryEntry.create(HistoryEntryRoleType.TOOL_RESULT, toolResultContent, undefined, executionEntry.name, toolCall.id);
            toolResultActivityEntries.push(toolResultActivityEntry);
          }

          if (newExecutionHistoryEntries.length > 0) {
            agentState = { ...agentState!, executionHistory: [...agentState!.executionHistory, ...newExecutionHistoryEntries] };
          }
          if (toolResultActivityEntries.length > 0) {
            for (const entry of toolResultActivityEntries) { currentActivityHistory = currentActivityHistory.addEntry(entry); }
            agentState = { ...agentState!, conversationHistory: currentActivityHistory };
          }
          job.updateAgentState(agentState);
          if (criticalErrorEncounteredThisTurn) break;
        }
        if (!criticalErrorEncounteredThisTurn) {
          goalAchieved = this._isGoalAchievedByLlmResponse(llmResponseText, assistantMessage?.tool_calls);
        }
        if (goalAchieved) { this.logger.info(`Goal achieved for Job ID: ${jobId.value} in iteration ${iterations}.`); break; }
        if (iterations >= maxIterations) { this.logger.info(`Max iterations reached for Job ID: ${jobId.value}.`); }
      }

      let finalStatus: AgentExecutorStatus;
      let finalMessage: string;
      let finalOutput: unknown = undefined;
      const hasToolErrorInLastProcessedBatch = newExecutionHistoryEntries.some(e => e.type === 'tool_error');

      if (goalAchieved) {
        finalStatus = 'SUCCESS';
        finalMessage = `Goal achieved. Last LLM response: ${llmResponseText}`;
        finalOutput = { message: llmResponseText };
        job.updateLastFailureSummary(undefined);
      } else if (criticalErrorEncounteredThisTurn) {
        finalStatus = agentState?.executionHistory.some(e => e.type === 'llm_error') ? 'FAILURE_LLM' : 'FAILURE_TOOL';
        finalMessage = job.currentData().lastFailureSummary || `Processing stopped due to a critical error after ${iterations} iterations. Last LLM response: ${llmResponseText}`;
      } else if (iterations >= maxIterations) {
        finalStatus = 'FAILURE_MAX_ITERATIONS';
        finalMessage = `Max iterations (${maxIterations}) reached. Goal not achieved. Last LLM response: ${llmResponseText}`;
        job.updateLastFailureSummary(finalMessage);
      } else if (hasToolErrorInLastProcessedBatch) {
        finalStatus = 'FAILURE_TOOL';
        const lastToolError = newExecutionHistoryEntries.find(e => e.type === 'tool_error') || agentState?.executionHistory.slice().reverse().find(e => e.type === 'tool_error');
        finalMessage = `Processing ended after ${iterations} iterations with unresolved tool errors. Last tool error: ${JSON.stringify(lastToolError?.error)}. Last LLM response: ${llmResponseText}`;
        job.updateLastFailureSummary(finalMessage);
      } else {
        finalStatus = 'FAILURE_INTERNAL';
        finalMessage = `Processing stopped after ${iterations} iterations without explicit goal or max iterations. Last LLM response: ${llmResponseText}`;
        this.logger.warn(finalMessage, { jobId: jobId.value });
        job.updateLastFailureSummary(finalMessage);
      }
      agentExecutorResult = this._createFinalResult(job, finalStatus, finalMessage, finalOutput);
    } catch (e: unknown) {
      const errorObject = e instanceof Error ? e : new Error(String(e));
      const internalErrorMessage = `Unhandled error during execution of Job ID: ${jobId.value}. Error: ${errorObject.message}`;
      this.logger.error(internalErrorMessage, errorObject, { jobId: jobId.value });
      let currentAgentStateForError = job.currentData().agentState;
      if (!currentAgentStateForError) { currentAgentStateForError = { conversationHistory: ActivityHistory.create([]), executionHistory: [] }; }
      const updatedExecutionHistory = [...currentAgentStateForError.executionHistory, { timestamp: new Date(), type: 'system_error', name: 'UnhandledExecutorError', error: errorObject.message }];
      job.updateAgentState({ ...currentAgentStateForError, executionHistory: updatedExecutionHistory });
      agentExecutorResult = this._createFinalResult(job, 'FAILURE_INTERNAL', internalErrorMessage);
    }

    job.finalizeExecution(agentExecutorResult);

    const finalSaveResult = await this.jobRepository.save(job);
    if (finalSaveResult.isErr()) {
      this.logger.error(`CRITICAL: Failed to save final state of Job ID: ${jobId.value}. Error: ${finalSaveResult.error.message}`, finalSaveResult.error);
      const finalSaveError = new ApplicationError(`Failed to persist final job state for job ${jobId.value}: ${finalSaveResult.error.message}. Original status: ${agentExecutorResult.status}`, finalSaveResult.error);
      if (agentExecutorResult.status !== 'SUCCESS') {
        return error(finalSaveError);
      }
      return error(finalSaveError);
    }

    this.logger.info(`Job ID: ${jobId.value} finalized with status: ${agentExecutorResult.status} and persisted successfully.`);

    if (agentExecutorResult.status !== 'SUCCESS') {
      const executionError = new ApplicationError(`Job execution failed with status ${agentExecutorResult.status}: ${agentExecutorResult.message}`, agentExecutorResult.errors);
      return error(executionError);
    }

    return ok(agentExecutorResult);
  }

  // Renamed private methods with underscore prefix
  private _updateJobToActiveStatus(job: Job): Result<void, ApplicationError> {
    if (job.moveToActive()) {
      return ok(undefined);
    }
    const { id: jobId, status } = job.props;
    this.logger.warn(`Job ID: ${jobId.value} could not be moved to ACTIVE state. Current status: ${status.value}`);
    if (!status.is(JobStatusType.ACTIVE)) {
      return error(new ApplicationError(`Job ${jobId.value} could not be set to ACTIVE.`));
    }
    return ok(undefined);
  }

  private _convertActivityHistoryToLlmMessages(systemMessageContent: string, history: ActivityHistory): LanguageModelMessage[] {
    const messages: LanguageModelMessage[] = [{ role: 'system', content: systemMessageContent }];
    history.entries().forEach(entry => {
      const role = entry.role();
      const content = entry.content();
      if (role === HistoryEntryRoleType.USER) {
        messages.push({ role: 'user', content });
      } else if (role === HistoryEntryRoleType.ASSISTANT) {
        messages.push({ role: 'assistant', content, tool_calls: entry.props.tool_calls || undefined });
      } else if (role === HistoryEntryRoleType.TOOL_RESULT) {
        messages.push({ role: 'tool', tool_call_id: entry.toolCallId(), content });
      }
    });
    return messages;
  }

  private async _processAndValidateSingleToolCall(toolCall: LanguageModelMessageToolCall, jobIdForLogging: string, agentIdForContext: string): Promise<ExecutionHistoryEntry> {
    const toolName = toolCall.function.name;
    const timestamp = new Date();
    const toolResult = await this.toolRegistryService.getTool(toolName);

    if (toolResult.isErr()) {
      const toolNotFoundError = new ToolError(`Tool '${toolName}' not found. Error: ${toolResult.error.message}`, toolName, toolResult.error, false);
      this.logger.error(toolNotFoundError.message, toolNotFoundError, { jobId: jobIdForLogging, toolName });
      return { timestamp, type: 'tool_error', name: toolName, error: toolNotFoundError, isCritical: true };
    }
    const tool = toolResult.value;

    let parsedArgs: unknown;
    try {
      parsedArgs = JSON.parse(toolCall.function.arguments);
    } catch (e: unknown) {
      const parseError = e instanceof Error ? e : new Error(String(e));
      const parsingToolError = new ToolError(`Failed to parse arguments for tool '${toolName}'. Error: ${parseError.message}`, toolName, parseError, true);
      this.logger.error(parsingToolError.message, parsingToolError, { jobId: jobIdForLogging, toolName, args: toolCall.function.arguments });
      return { timestamp, type: 'tool_error', name: toolName, error: parsingToolError, params: { originalArgs: toolCall.function.arguments } };
    }

    const validationResult = tool.parameters.safeParse(parsedArgs);
    if (!validationResult.success) {
      const validationToolError = new ToolError(`Argument validation failed for tool '${toolName}'.`, toolName, validationResult.error, true);
      this.logger.error(validationToolError.message, validationToolError, { jobId: jobIdForLogging, toolName, issues: validationResult.error.flatten() });
      return { timestamp, type: 'tool_error', name: toolName, error: validationToolError, params: parsedArgs, isCritical: false };
    }

    this.logger.info(`Tool call validated: ${toolName} with args: ${JSON.stringify(validationResult.data)}`, { jobId: jobIdForLogging, toolName });
    const executionContext: IToolExecutionContext = { agentId: agentIdForContext, jobId: jobIdForLogging };

    try {
      const toolExecResult = await tool.execute(validationResult.data, executionContext);
      if (toolExecResult.isErr()) {
        const toolErrorFromTool = toolExecResult.error;
        this.logger.error(`Tool '${toolName}' execution failed for Job ID: ${jobIdForLogging}. Error: ${toolErrorFromTool.message}`, toolErrorFromTool);
        return { timestamp, type: 'tool_error', name: toolName, params: validationResult.data, error: toolErrorFromTool, isCritical: !toolErrorFromTool.isRecoverable };
      }
      this.logger.info(`Tool '${toolName}' executed successfully for Job ID: ${jobIdForLogging}`, { result: toolExecResult.value });
      return { timestamp, type: 'tool_call', name: toolName, params: validationResult.data, result: toolExecResult.value };
    } catch (e: unknown) {
      const execError = e instanceof Error ? e : new Error(String(e));
      const unexpectedToolError = new ToolError(`Unexpected error during tool '${toolName}' execution: ${execError.message}`, toolName, execError, false);
      this.logger.error(unexpectedToolError.message, unexpectedToolError, { jobId: jobIdForLogging, toolName });
      return { timestamp, type: 'tool_error', name: toolName, error: unexpectedToolError, params: validationResult.data, isCritical: true };
    }
  }

  private _isGoalAchievedByLlmResponse(responseText: string, toolCalls?: LanguageModelMessageToolCall[]): boolean {
    if (toolCalls && toolCalls.length > 0) return false;
    return responseText.toLowerCase().includes('task complete');
  }

  private _logLlmCall(job: Job, messages: LanguageModelMessage[]): void {
    const { id: jobIdVo, attemptsMade: attemptsVo } = job.props;
    this.logger.info(`Calling LLM for Job ID: ${jobIdVo.value}. Attempt ${attemptsVo.value}`, {
      jobId: jobIdVo.value,
      messages: messages.map(m => ({ role: m.role, content: m.content ? m.content.substring(0, 100) + '...' : null })),
    });
  }

  private _createFinalResult(job: Job, statusToSet: AgentExecutorStatus, finalMessage: string, outputData?: unknown): AgentExecutorResult {
    const agentState = job.currentData().agentState || { conversationHistory: ActivityHistory.create([]), executionHistory: [] };
    const jobIdVo = job.id();
    const executionErrorEntries = agentState.executionHistory.filter(e => e.type.endsWith('_error'));
    return {
      jobId: jobIdVo.value(),
      status: statusToSet,
      message: finalMessage,
      output: outputData,
      history: agentState.conversationHistory.entries(),
      errors: executionErrorEntries,
    };
  }

  private _attemptReplanForUnusableResponse(
    job: Job,
    assistantMessage: LanguageModelMessage,
    llmResponseText: string,
    currentActivityHistory: ActivityHistory,
    currentAgentState: NonNullable<Job['data']['agentState']>,
    replanAttempts: number,
    currentIteration: number,
  ): {
    shouldReplan: boolean;
    updatedHistory?: ActivityHistory;
    updatedAgentState?: NonNullable<Job['data']['agentState']>;
    newReplanAttemptCount?: number;
  } {
    const { id: jobId } = job.props;
    if ((!llmResponseText || llmResponseText.length < this.minUsableLlmResponseLength) && (!assistantMessage.tool_calls || assistantMessage.tool_calls.length === 0)) {
      if (replanAttempts < this.maxReplanAttemptsForEmptyResponse) {
        this.logger.warn(`LLM response for Job ID ${jobId.value} was empty/too short. Attempting re-plan (${replanAttempts + 1}/${this.maxReplanAttemptsForEmptyResponse})`);
        const systemNote = ActivityHistoryEntry.create(HistoryEntryRoleType.USER, `System Note: Your previous response was empty or too short (received: "${llmResponseText}"). Please provide a more detailed response or use a tool.`);
        const updatedHistory = currentActivityHistory.addEntry(systemNote);
        const updatedAgentState = { ...currentAgentState, conversationHistory: updatedHistory, executionHistory: [...currentAgentState.executionHistory, { timestamp: new Date(), type: 'unusable_llm_response', name: 'LLM Replan Trigger', error: `Empty/short response: ${llmResponseText}` }] };
        return { shouldReplan: true, updatedHistory, updatedAgentState, newReplanAttemptCount: replanAttempts + 1 };
      }
      this.logger.warn(`LLM response for Job ID ${jobId.value} was empty/too short after ${replanAttempts} re-plan attempts. Proceeding with this response.`);
    }
    return { shouldReplan: false, newReplanAttemptCount: replanAttempts };
  }
}
