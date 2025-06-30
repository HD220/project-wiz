// src_refactored/core/application/services/generic-agent-executor.service.ts
import { injectable, inject } from 'inversify';

import { ApplicationError } from '@/core/application/common/errors';
import { IAgentExecutor } from '@/core/application/ports/services/i-agent-executor.interface';
import { IToolRegistryService, TOOL_REGISTRY_SERVICE_TOKEN } from '@/core/application/ports/services/i-tool-registry.service';
import { ILoggerService, LoggerServiceToken } from '@/core/common/services/i-logger.service';
import { Agent } from '@/core/domain/agent/agent.entity';
import { IAgentRepository, AGENT_REPOSITORY_TOKEN } from '@/core/domain/agent/ports/agent-repository.interface';
import { AgentIdVO } from '@/core/domain/agent/value-objects/agent-id.vo';
// DomainError, ValueError not used
import { ToolError } from '@/core/domain/common/errors';
// Renamed from AgentExecutorResult
import {
  JobProcessingOutput,
  AgentExecutionPayload,
  ExecutionHistoryEntry,
  AgentExecutorStatus,
  // Make sure this is defined or remove if not used
  // CriticalToolFailureInfo, // Not used
} from '@/core/domain/job/job-processing.types';
import { JobEntity } from '@/core/domain/job/job.entity';
// Renamed types
import { ActivityHistoryEntryVO, ActivityEntryType } from '@/core/domain/job/value-objects/activity-history-entry.vo';
// Renamed type
import { ActivityHistoryVO } from '@/core/domain/job/value-objects/activity-history.vo';
import { ILLMAdapter, ILLMAdapterToken } from '@/core/ports/adapters/llm-adapter.interface';
import { LanguageModelMessage, LanguageModelMessageToolCall } from '@/core/ports/adapters/llm-adapter.types';
import { IToolExecutionContext, IAgentTool } from '@/core/tools/tool.interface';
import { z } from 'zod';

// Result might not be needed for return type if throwing errors
// import { Result, ok, error } from '@/shared/result'; // Not used

interface ExecutionState {
  goalAchieved: boolean;
  iterations: number;
  maxIterations: number;
  llmResponseText: string;
  assistantMessage: LanguageModelMessage | null;
  replanAttemptsForEmptyResponse: number;
  criticalErrorEncounteredThisTurn: boolean;
  activityHistory: ActivityHistoryVO;
  executionHistory: ExecutionHistoryEntry[];
}

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
    // JobEntity with specific payload
    job: JobEntity<AgentExecutionPayload, JobProcessingOutput>
    // Returns JobProcessingOutput directly, throws on critical failure
  ): Promise<JobProcessingOutput> {
    const jobPayload = job.payload;
    const agentId = jobPayload.agentId;
    const jobId = job.id;

    this.logger.info(`Processing Job ID: ${jobId.value} with Agent ID: ${agentId}`, { jobId: jobId.value, agentId });

    const agent = await this._fetchAgent(agentId, job);
    const { currentActivityHistory, currentExecutionHistory } = this._initializeHistories(job, jobPayload);

    this.logger.info(`Job ID: ${jobId.value} processing attempt: ${job.attemptsMade}`);
    job.updateProgress(10);

    const executionState = {
      goalAchieved: false,
      iterations: 0,
      maxIterations: agent.maxIterations.value,
      llmResponseText: 'No response yet.',
      assistantMessage: null as LanguageModelMessage | null,
      replanAttemptsForEmptyResponse: 0,
      criticalErrorEncounteredThisTurn: false,
      activityHistory: currentActivityHistory,
      executionHistory: currentExecutionHistory,
    };

    this.logger.info(`Max iterations for Job ID: ${jobId.value} set to ${executionState.maxIterations}`);

    await this._executionLoop(job, agent, executionState);

    return this._constructFinalResult(job, executionState);
  }

  private async _executionLoop(
    job: JobEntity<AgentExecutionPayload, JobProcessingOutput>,
    agent: Agent,
    executionState: ExecutionState
  ): Promise<void> {
    while (executionState.iterations < executionState.maxIterations && !executionState.goalAchieved && !executionState.criticalErrorEncounteredThisTurn) {
      executionState.iterations++;
      this.logger.info(`Starting LLM interaction cycle ${executionState.iterations} for Job ID: ${job.id.value}`);
      job.updateProgress(10 + (80 * executionState.iterations / executionState.maxIterations));

      await this._performLlmInteraction(job, agent, executionState);

      if (executionState.criticalErrorEncounteredThisTurn) break;

      this._checkGoalAchieved(executionState);

      if (executionState.goalAchieved) {
        this.logger.info(`Goal achieved for Job ID: ${job.id.value} in iteration ${executionState.iterations}.`);
        break;
      }
      if (executionState.iterations >= executionState.maxIterations) {
        this.logger.info(`Max iterations reached for Job ID: ${job.id.value}.`);
      }
    }
  }

  private async _fetchAgent(agentId: string, job: JobEntity<AgentExecutionPayload, JobProcessingOutput>) {
    const agentResult = await this.agentRepository.findById(AgentIdVO.create(agentId));
    if (agentResult.isError() || !agentResult.value) {
      const message = `Agent with ID ${agentId} not found or error fetching.`;
      this.logger.error(message, agentResult.isError() ? agentResult.error : undefined);
      job.addLog(message, 'ERROR');
      throw new ApplicationError(message);
    }
    return agentResult.value;
  }

  private _initializeHistories(job: JobEntity<AgentExecutionPayload, JobProcessingOutput>, jobPayload: AgentExecutionPayload) {
    let activityHistory = job.getConversationHistory();
    if (activityHistory.length === 0) {
      const userPromptContent = jobPayload.initialPrompt || `Based on your persona, please address the following task: ${job.name}`;
      const userPromptEntry = ActivityHistoryEntryVO.create(ActivityEntryType.USER, userPromptContent);
      job.addConversationEntry(userPromptEntry);
      activityHistory = job.getConversationHistory();
    }
    return { currentActivityHistory: activityHistory, currentExecutionHistory: [...job.getExecutionHistory()] };
  }

  private async _performLlmInteraction(
    job: JobEntity<AgentExecutionPayload, JobProcessingOutput>,
    agent: Agent,
    state: ExecutionState
  ) {
    const persona = agent.personaTemplate;
    const systemMessageString = `You are ${persona.name.value}, a ${persona.role.value}. Your goal is: ${persona.goal.value}. Persona backstory: ${persona.backstory.value()}`;
    const conversationMessages = this._convertActivityHistoryToLlmMessages(systemMessageString, state.activityHistory);

    this._logLlmCall(job.id.value, job.attemptsMade, conversationMessages);
    job.addLog(`Calling LLM (iteration ${state.iterations})`, 'DEBUG', {
      messages: conversationMessages.map(message => ({ role: message.role, content: message.content ? String(message.content).substring(0, 50) + '...' : null }))
    });

    const llmGenerationResult = await this.llmAdapter.generateText(conversationMessages, { temperature: agent.temperature.value });

    if (llmGenerationResult.isError()) {
      const llmError = llmGenerationResult.error;
      const errorMessage = `LLM generation failed in iteration ${state.iterations}. Error: ${llmError.message}`;
      this.logger.error(errorMessage, llmError, { jobId: job.id.value });
      job.addExecutionHistoryEntry({ timestamp: new Date(), type: 'llm_error', name: 'LLM Generation', error: llmError.message });
      throw new ApplicationError(errorMessage, llmError);
    }

    state.assistantMessage = llmGenerationResult.value;
    state.llmResponseText = state.assistantMessage.content || '';
    this.logger.info(`LLM response (iteration ${state.iterations}) for Job ID: ${job.id.value}: ${state.llmResponseText.substring(0, 100)}...`);
    job.addLog(`LLM Response (iteration ${state.iterations}): ${state.llmResponseText.substring(0, 100)}...`, 'DEBUG');

    // Inlined _attemptReplanForUnusableResponse
    if ((!state.llmResponseText || state.llmResponseText.length < this.minUsableLlmResponseLength) && (!state.assistantMessage.tool_calls || state.assistantMessage.tool_calls.length === 0)) {
      if (state.replanAttemptsForEmptyResponse < this.maxReplanAttemptsForEmptyResponse) {
        this.logger.warn(`LLM response for Job ID ${job.id.value} was empty/too short. Attempting re-plan (${state.replanAttemptsForEmptyResponse + 1}/${this.maxReplanAttemptsForEmptyResponse})`);
        const systemNote = ActivityHistoryEntryVO.create(ActivityEntryType.USER, `System Note: Your previous response was empty or too short (received: "${state.llmResponseText}"). Please provide a more detailed response or use a tool.`);
        const updatedHistory = state.activityHistory.addEntry(systemNote);
        const updatedExecutionHistory = [...state.executionHistory, { timestamp: new Date(), type: 'unusable_llm_response' as ExecutionHistoryEntry['type'], name: 'LLM Replan Trigger', error: `Empty/short response: ${state.llmResponseText}` }];

        job.setConversationHistory(updatedHistory);
        job.setExecutionHistory(updatedExecutionHistory);
        state.activityHistory = job.getConversationHistory();
        state.executionHistory = [...job.getExecutionHistory()];
        state.replanAttemptsForEmptyResponse++;
        job.addLog(`LLM response was unusable. Re-planning (attempt ${state.replanAttemptsForEmptyResponse}).`, 'WARN');
        return; // Skip tool processing for this iteration
      }
      this.logger.warn(`LLM response for Job ID ${job.id.value} was empty/too short after ${state.replanAttemptsForEmptyResponse} re-plan attempts. Proceeding with this response.`);
    }

    const assistantHistoryEntry = ActivityHistoryEntryVO.create(ActivityEntryType.ASSISTANT, state.assistantMessage.content || '', { tool_calls: state.assistantMessage.tool_calls as LanguageModelMessageToolCall[] | undefined });
    job.addConversationEntry(assistantHistoryEntry);
    state.activityHistory = job.getConversationHistory();

    // newExecutionHistoryEntries = []; // Not used
    // const toolResultActivityEntries: ActivityHistoryEntryVO[] = []; // Not used

    await this._handleToolCallsIfPresent(job, agent, state);
  }

  private async _handleToolCallsIfPresent(
    job: JobEntity<AgentExecutionPayload, JobProcessingOutput>,
    agent: Agent,
    state: ExecutionState
  ) {
    if (state.assistantMessage?.tool_calls && state.assistantMessage.tool_calls.length > 0) {
      await this._processToolCalls(job, agent, state);
    }
  }

  private async _processToolCalls(
    job: JobEntity<AgentExecutionPayload, JobProcessingOutput>,
    agent: Agent,
    state: ExecutionState
  ) {
    this.logger.info(`LLM requested ${state.assistantMessage.tool_calls.length} tool calls for Job ID: ${job.id.value}`);
    job.addLog(`LLM requesting ${state.assistantMessage.tool_calls.length} tool calls.`, 'DEBUG');

    for (const toolCall of state.assistantMessage.tool_calls) {
      const executionContext: IToolExecutionContext = { agentId: agent.id.value, jobId: job.id.value, userId: job.payload.userId };
      const executionEntry = await this._processAndValidateSingleToolCall(toolCall, executionContext);
      job.addExecutionHistoryEntry(executionEntry);
      // Keep local copy in sync
      state.executionHistory.push(executionEntry);

      if (executionEntry.type === 'tool_error' && executionEntry.error instanceof ToolError) {
        const toolError = executionEntry.error;
        job.addLog(`Tool '${toolError.toolName || executionEntry.name}' error: ${toolError.message}`, 'ERROR', { isRecoverable: toolError.isRecoverable });
        if (!toolError.isRecoverable) {
          state.criticalErrorEncounteredThisTurn = true;
          this.logger.error(`Critical tool error for Job ID ${job.id.value}: Tool '${toolError.toolName || executionEntry.name}' failed non-recoverably.`, toolError);
          break;
        }
      }
      let toolResultContent: string | object;
      if (executionEntry.type === 'tool_error' && executionEntry.error) {
        const errDetails = executionEntry.error instanceof ToolError ? { name: executionEntry.error.name, message: executionEntry.error.message, toolName: executionEntry.error.toolName, isRecoverable: executionEntry.error.isRecoverable } : { message: String(executionEntry.error) };
        toolResultContent = errDetails;
      } else {
        toolResultContent = executionEntry.result as object;
      }
      const toolResultActivityEntry = ActivityHistoryEntryVO.create(ActivityEntryType.TOOL_RESULT, toolResultContent, { toolName: executionEntry.name, toolCallId: toolCall.id });
      job.addConversationEntry(toolResultActivityEntry);
    }
    // Re-fetch after potential updates
    state.activityHistory = job.getConversationHistory();
  }

  private _checkGoalAchieved(state: ExecutionState) {
    if (!state.criticalErrorEncounteredThisTurn) {
      state.goalAchieved = this._isGoalAchievedByLlmResponse(state.llmResponseText, state.assistantMessage?.tool_calls as LanguageModelMessageToolCall[] | undefined);
    }
  }

  private _constructFinalResult(
    job: JobEntity<AgentExecutionPayload, JobProcessingOutput>,
    state: ExecutionState
  ): JobProcessingOutput {
    if (state.goalAchieved) {
      return this._createSuccessResult(job, state);
    }
    if (state.criticalErrorEncounteredThisTurn) {
      return this._createCriticalErrorResult(job, state);
    }
    if (state.iterations >= state.maxIterations) {
      return this._createMaxIterationsResult(job, state);
    }
    return this._createInternalErrorResult(job, state);
  }

  private _createSuccessResult(job: JobEntity<AgentExecutionPayload, JobProcessingOutput>, state: ExecutionState): JobProcessingOutput {
    const finalMessage = `Goal achieved. Last LLM response: ${state.llmResponseText}`;
    const finalOutput = { message: state.llmResponseText, history: job.getConversationHistory().entries.map(entry => entry.toPersistence ? entry.toPersistence() : entry.props) };
    job.updateProgress(100);
    return {
      jobId: job.id.value,
      status: AgentExecutorStatus.SUCCESS,
      message: finalMessage,
      output: finalOutput,
      history: job.getConversationHistory().entries.map(entry => entry.toPersistence ? entry.toPersistence() : entry.props),
      errors: state.executionHistory.filter((errorEntry: ExecutionHistoryEntry) => errorEntry.type.endsWith('_error')),
    };
  }

  private _createCriticalErrorResult(job: JobEntity<AgentExecutionPayload, JobProcessingOutput>, state: ExecutionState): JobProcessingOutput {
    const lastErrorEntry = state.executionHistory.slice().reverse().find((errorEntry: ExecutionHistoryEntry) => errorEntry.type.endsWith('_error'));
    // const finalStatus = lastErrorEntry?.type === 'llm_error' ? AgentExecutorStatus.FAILURE_LLM : AgentExecutorStatus.FAILURE_TOOL; // Not used
    const finalMessage = `Processing stopped due to a critical error after ${state.iterations} iterations. Error: ${lastErrorEntry?.error ? String(lastErrorEntry.error) : 'Unknown critical error'}`;
    job.addLog(finalMessage, 'ERROR');
    throw new ApplicationError(finalMessage);
  }

  private _createMaxIterationsResult(job: JobEntity<AgentExecutionPayload, JobProcessingOutput>, state: ExecutionState): JobProcessingOutput {
    const finalMessage = `Max iterations (${state.maxIterations}) reached. Goal not achieved. Last LLM response: ${state.llmResponseText}`;
    job.addLog(finalMessage, 'WARN');
    throw new ApplicationError(finalMessage);
  }

  private _createInternalErrorResult(job: JobEntity<AgentExecutionPayload, JobProcessingOutput>, state: ExecutionState): JobProcessingOutput {
    const finalMessage = `Processing stopped unexpectedly after ${state.iterations} iterations. Last LLM response: ${state.llmResponseText}`;
    this.logger.warn(finalMessage, { jobId: job.id.value });
    job.addLog(finalMessage, 'ERROR');
    throw new ApplicationError(finalMessage);
  }

  private _convertActivityHistoryToLlmMessages(systemMessageContent: string, history: ActivityHistoryVO): LanguageModelMessage[] {
    const messages: LanguageModelMessage[] = [{ role: 'system', content: systemMessageContent }];
    // Access entries directly
    history.entries.forEach(entry => {
      // Use type
      const role = entry.type;
      // Ensure string content
      const content = typeof entry.content === 'string' ? entry.content : JSON.stringify(entry.content);
      const toolCalls = entry.metadata?.tool_calls as LanguageModelMessageToolCall[] | undefined;
      const toolCallId = entry.metadata?.toolCallId as string | undefined;

      // Use ActivityEntryType
      if (role === ActivityEntryType.USER) {
        messages.push({ role: 'user', content });
        // Use ActivityEntryType
      } else if (role === ActivityEntryType.ASSISTANT) {
        messages.push({ role: 'assistant', content, tool_calls: toolCalls });
        // Use ActivityEntryType
      } else if (role === ActivityEntryType.TOOL_RESULT) {
        if (toolCallId) {
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

    const toolInstance = this.toolRegistryService.getTool(toolName);
    if (!toolInstance) {
      return this._createToolNotFoundError(toolName, timestamp, executionContext.jobId);
    }

    const parsedArgs = this._parseToolArguments(toolCall, toolName, timestamp, executionContext.jobId);
    if (parsedArgs.error) {
      return parsedArgs.error;
    }

    const validationResult = toolInstance.parameters.safeParse(parsedArgs.value);
    if (!validationResult.success) {
      return this._createToolValidationError(toolName, timestamp, validationResult.error, parsedArgs.value, executionContext.jobId);
    }

    this.logger.info(`Tool call validated: ${toolName} with args: ${JSON.stringify(validationResult.data)}`, { toolName, jobId: executionContext.jobId });
    return this._executeTool(toolInstance, validationResult.data, timestamp, executionContext);
  }

  private _createToolNotFoundError(toolName: string, timestamp: Date, jobId: string): ExecutionHistoryEntry {
    const toolNotFoundError = new ToolError(`Tool '${toolName}' not found.`, toolName, undefined, false);
    this.logger.error(toolNotFoundError.message, { toolName, jobId });
    return { timestamp, type: 'tool_error', name: toolName, error: toolNotFoundError, isCritical: true };
  }

  private _parseToolArguments(toolCall: LanguageModelMessageToolCall, toolName: string, timestamp: Date, jobId: string): { value?: unknown; error?: ExecutionHistoryEntry } {
    try {
      return { value: JSON.parse(toolCall.function.arguments) };
    } catch (error: unknown) {
      const parseError = error instanceof Error ? error : new Error(String(error));
      const parsingToolError = new ToolError(`Failed to parse arguments for tool '${toolName}'. Error: ${parseError.message}`, toolName, parseError, true);
      this.logger.error(parsingToolError.message, { toolName, args: toolCall.function.arguments, jobId });
      return { error: { timestamp, type: 'tool_error', name: toolName, error: parsingToolError, params: { originalArgs: toolCall.function.arguments }, isCritical: false } };
    }
  }

  private _createToolValidationError(toolName: string, timestamp: Date, validationError: z.ZodError, parsedArgs: unknown, jobId: string): ExecutionHistoryEntry {
    const validationToolError = new ToolError(`Argument validation failed for tool '${toolName}'.`, toolName, validationError, true);
    this.logger.error(validationToolError.message, { toolName, issues: validationError.flatten(), jobId });
    return { timestamp, type: 'tool_error', name: toolName, error: validationToolError, params: parsedArgs, isCritical: false };
  }

  private async _executeTool(toolInstance: IAgentTool, validatedArgs: unknown, timestamp: Date, executionContext: IToolExecutionContext): Promise<ExecutionHistoryEntry> {
    const toolName = toolInstance.name; // Assuming toolInstance has a name property
    try {
      const toolExecResult = await toolInstance.execute(validatedArgs, executionContext);
      if (toolExecResult.isError()) {
        const toolErrorFromTool = toolExecResult.error;
        this.logger.error(`Tool '${toolName}' execution failed: ${toolErrorFromTool.message}`, { toolError: toolErrorFromTool, jobId: executionContext.jobId });
        return { timestamp, type: 'tool_error', name: toolName, params: validatedArgs, error: toolErrorFromTool, isCritical: !toolErrorFromTool.isRecoverable };
      }
      this.logger.info(`Tool '${toolName}' executed successfully.`, { result: toolExecResult.value, jobId: executionContext.jobId });
      return { timestamp, type: 'tool_result', name: toolName, params: validatedArgs, result: toolExecResult.value };
    } catch (error: unknown) {
      const execError = error instanceof Error ? error : new Error(String(error));
      const unexpectedToolError = new ToolError(`Unexpected error during tool '${toolName}' execution: ${execError.message}`, toolName, execError, false);
      this.logger.error(unexpectedToolError.message, { error: unexpectedToolError, jobId: executionContext.jobId });
      return { timestamp, type: 'tool_error', name: toolName, error: unexpectedToolError, params: validatedArgs, isCritical: true };
    }
  }

  private _isGoalAchievedByLlmResponse(responseText: string, toolCalls?: LanguageModelMessageToolCall[]): boolean {
    if (toolCalls && toolCalls.length > 0) return false;
    return responseText.toLowerCase().includes('task complete');
  }

  private _logLlmCall(jobId: string, attempt: number, messages: LanguageModelMessage[]): void {
    this.logger.info(`Calling LLM for Job ID: ${jobId}. Attempt ${attempt}`, {
      jobId: jobId,
      messages: messages.map(message => ({ role: message.role, content: message.content ? String(message.content).substring(0, 100) + '...' : null, tool_calls: message.tool_calls })),
    });
  }

  // This method is no longer part of this service's responsibility.
  // JobWorkerService handles final job state.
  // private _createFinalResult(job: JobEntity<AgentExecutionPayload, JobProcessingOutput>, statusToSet: AgentExecutorStatus, finalMessage: string, outputData?: unknown): JobProcessingOutput { ... }
}
