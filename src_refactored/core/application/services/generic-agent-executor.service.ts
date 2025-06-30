// src_refactored/core/application/services/generic-agent-executor.service.ts
import { injectable, inject } from 'inversify';

import { ApplicationError } from '@/core/application/common/errors';
import { IAgentExecutor } from '@/core/application/ports/services/i-agent-executor.interface';
import { IToolRegistryService, TOOL_REGISTRY_SERVICE_TOKEN } from '@/core/application/ports/services/i-tool-registry.service';
import { ILoggerService, LoggerServiceToken } from '@/core/common/services/i-logger.service';
import { Agent } from '@/core/domain/agent/agent.entity';
import { IAgentRepository, AGENT_REPOSITORY_TOKEN } from '@/core/domain/agent/ports/agent-repository.interface';
import { AgentIdVO } from '@/core/domain/agent/value-objects/agent-id.vo'; // Added import
import { DomainError, ToolError, ValueError } from '@/core/domain/common/errors';
import {
  JobProcessingOutput, // Renamed from AgentExecutorResult
  AgentExecutionPayload,
  ExecutionHistoryEntry,
  AgentExecutorStatus,
  CriticalToolFailureInfo, // Make sure this is defined or remove if not used
} from '@/core/domain/job/job-processing.types';
import { JobEntity } from '@/core/domain/job/job.entity';
import { ActivityHistoryEntryVO, ActivityEntryType } from '@/core/domain/job/value-objects/activity-history-entry.vo'; // Renamed types
import { ActivityHistoryVO } from '@/core/domain/job/value-objects/activity-history.vo'; // Renamed type
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
    job: JobEntity<AgentExecutionPayload, JobProcessingOutput> // JobEntity with specific payload
  ): Promise<JobProcessingOutput> { // Returns JobProcessingOutput directly, throws on critical failure
    const jobPayload = job.payload;
    const agentId = jobPayload.agentId;
    const jobId = job.id; // JobIdVO

    this.logger.info(
      `Processing Job ID: ${jobId.value} with Agent ID: ${agentId}`,
      { jobId: jobId.value, agentId: agentId },
    );

    const agentResult = await this.agentRepository.findById(AgentIdVO.create(agentId)); // Use AgentIdVO
    if (agentResult.isError() || !agentResult.value) {
      const message = `Agent with ID ${agentId} not found or error fetching.`;
      this.logger.error(message, agentResult.isError() ? agentResult.error : undefined);
      job.addLog(message, 'ERROR'); // Use existing addLog method
      throw new ApplicationError(message); // Worker will catch this and fail the job
    }
    const agent = agentResult.value;

    const agent = agentResult.value;

    // Initialize histories from JobEntity
    let currentActivityHistory = job.getConversationHistory();
    let currentExecutionHistory = [...job.getExecutionHistory()]; // Get a mutable copy

    // Ensure conversation history is initialized
    if (currentActivityHistory.length === 0) {
      const userPromptContent = jobPayload.initialPrompt || `Based on your persona, please address the following task: ${job.name}`;
      const userPromptEntry = ActivityHistoryEntryVO.create(ActivityEntryType.USER, userPromptContent);
      job.addConversationEntry(userPromptEntry);
      currentActivityHistory = job.getConversationHistory(); // Re-fetch after adding
    }

    // Job status is managed by JobWorkerService. Log current attempt.
    this.logger.info(`Job ID: ${jobId.value} processing attempt: ${job.attemptsMade}`);
    job.updateProgress(10); // Example: initial progress

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
      job.updateProgress(10 + (80 * iterations / maxIterations)); // Update progress

      const persona = agent.personaTemplate;
      const systemMessageString = `You are ${persona.name.value}, a ${persona.role.value}. Your goal is: ${persona.goal.value}. Persona backstory: ${persona.backstory.value()}`;
      const conversationMessages = this._convertActivityHistoryToLlmMessages(systemMessageString, currentActivityHistory);

      this._logLlmCall(jobId.value, job.attemptsMade, conversationMessages);
      job.addLog(`Calling LLM (iteration ${iterations})`, 'DEBUG', { // Use job.addLog
        messages: conversationMessages.map(m => ({ role: m.role, content: m.content ? String(m.content).substring(0, 50) + '...' : null}))
      });

      const llmGenerationResult = await this.llmAdapter.generateText(
        conversationMessages,
        { temperature: agent.temperature.value },
      );

      if (llmGenerationResult.isError()) {
        const llmError = llmGenerationResult.error;
        const errorMessage = `LLM generation failed in iteration ${iterations}. Error: ${llmError.message}`;
        this.logger.error(errorMessage, llmError, { jobId: jobId.value });
        job.addExecutionHistoryEntry({ timestamp: new Date(), type: 'llm_error', name: 'LLM Generation', error: llmError.message });
        throw new ApplicationError(errorMessage, llmError);
      }

      assistantMessage = llmGenerationResult.value;
      llmResponseText = assistantMessage.content || '';
      this.logger.info(`LLM response (iteration ${iterations}) for Job ID: ${jobId.value}: ${llmResponseText.substring(0, 100)}...`);
      job.addLog(`LLM Response (iteration ${iterations}): ${llmResponseText.substring(0,100)}...`, 'DEBUG');

      const replanResult = this._attemptReplanForUnusableResponse(
        jobId.value, assistantMessage, llmResponseText, currentActivityHistory, currentExecutionHistory, // Pass currentExecutionHistory
        replanAttemptsForEmptyResponse
      );

      if (replanResult.shouldReplan) {
        job.setConversationHistory(replanResult.updatedHistory!);
        job.setExecutionHistory(replanResult.updatedExecutionHistory!);
        currentActivityHistory = job.getConversationHistory();
        currentExecutionHistory = [...job.getExecutionHistory()];
        replanAttemptsForEmptyResponse = replanResult.newReplanAttemptCount!;
        job.addLog(`LLM response was unusable. Re-planning (attempt ${replanAttemptsForEmptyResponse}).`, 'WARN');
        continue;
      }

      const assistantHistoryEntry = ActivityHistoryEntryVO.create(
        ActivityEntryType.ASSISTANT,
        assistantMessage.content || '',
        { tool_calls: assistantMessage.tool_calls as LanguageModelMessageToolCall[] | undefined }
      );
      job.addConversationEntry(assistantHistoryEntry);
      currentActivityHistory = job.getConversationHistory();

      newExecutionHistoryEntries = [];
      const toolResultActivityEntries: ActivityHistoryEntryVO[] = [];

      if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
        this.logger.info(`LLM requested ${assistantMessage.tool_calls.length} tool calls for Job ID: ${jobId.value}`);
        job.addLog(`LLM requesting ${assistantMessage.tool_calls.length} tool calls.`, 'DEBUG');

        for (const toolCall of assistantMessage.tool_calls) {
          const executionContext: IToolExecutionContext = { agentId: agent.id.value, jobId: jobId.value, userId: jobPayload.userId };
          const executionEntry = await this._processAndValidateSingleToolCall(toolCall, executionContext);
          job.addExecutionHistoryEntry(executionEntry); // Add to job's history
          // newExecutionHistoryEntries.push(executionEntry); // Not needed if directly adding to job

          if (executionEntry.type === 'tool_error' && executionEntry.error instanceof ToolError) {
            const toolError = executionEntry.error;
            job.addLog(`Tool '${toolError.toolName || executionEntry.name}' error: ${toolError.message}`, 'ERROR', { isRecoverable: toolError.isRecoverable });
            if (!toolError.isRecoverable) {
              criticalErrorEncounteredThisTurn = true;
              this.logger.error(`Critical tool error for Job ID ${jobId.value}: Tool '${toolError.toolName || executionEntry.name}' failed non-recoverably.`, toolError);
              break;
            }
          }
          let toolResultContent: string | object;
          if (executionEntry.type === 'tool_error' && executionEntry.error) {
            const errDetails = executionEntry.error instanceof ToolError ?
              { name: executionEntry.error.name, message: executionEntry.error.message, toolName: executionEntry.error.toolName, isRecoverable: executionEntry.error.isRecoverable } :
              { message: String(executionEntry.error) };
            toolResultContent = errDetails;
          } else {
            toolResultContent = executionEntry.result as object;
          }
          const toolResultActivityEntry = ActivityHistoryEntryVO.create(ActivityEntryType.TOOL_RESULT, toolResultContent, { toolName: executionEntry.name, toolCallId: toolCall.id });
          // toolResultActivityEntries.push(toolResultActivityEntry); // Accumulate locally before adding all at once
          job.addConversationEntry(toolResultActivityEntry); // Add directly to job's conversation history
        }
        currentActivityHistory = job.getConversationHistory(); // Re-fetch after potential updates
        currentExecutionHistory = [...job.getExecutionHistory()]; // Re-fetch

        if (criticalErrorEncounteredThisTurn) break;
      }

      if (!criticalErrorEncounteredThisTurn) {
        goalAchieved = this._isGoalAchievedByLlmResponse(llmResponseText, assistantMessage?.tool_calls as LanguageModelMessageToolCall[] | undefined);
      }

      if (goalAchieved) { this.logger.info(`Goal achieved for Job ID: ${jobId.value} in iteration ${iterations}.`); break; }
      if (iterations >= maxIterations) { this.logger.info(`Max iterations reached for Job ID: ${jobId.value}.`); }
    } // End of while loop

    currentExecutionHistory = [...job.getExecutionHistory()]; // Ensure it's latest before constructing result

    // Construct the final result
    let finalStatus: AgentExecutorStatus;
    let finalMessage: string;
    let finalOutput: unknown = undefined;

    if (goalAchieved) {
      finalStatus = AgentExecutorStatus.SUCCESS;
      finalMessage = `Goal achieved. Last LLM response: ${llmResponseText}`;
      finalOutput = { message: llmResponseText, history: job.getConversationHistory().entries.map(e => e.toPersistence ? e.toPersistence() : e.props) };
      job.updateProgress(100);
    } else if (criticalErrorEncounteredThisTurn) {
      const lastErrorEntry = currentExecutionHistory.slice().reverse().find(e => e.type.endsWith('_error'));
      finalStatus = lastErrorEntry?.type === 'llm_error' ? AgentExecutorStatus.FAILURE_LLM : AgentExecutorStatus.FAILURE_TOOL;
      finalMessage = `Processing stopped due to a critical error after ${iterations} iterations. Error: ${lastErrorEntry?.error ? String(lastErrorEntry.error) : 'Unknown critical error'}`;
      job.addLog(finalMessage, 'ERROR');
      throw new ApplicationError(finalMessage);
    } else if (iterations >= maxIterations) {
      finalStatus = AgentExecutorStatus.FAILURE_MAX_ITERATIONS;
      finalMessage = `Max iterations (${maxIterations}) reached. Goal not achieved. Last LLM response: ${llmResponseText}`;
      job.addLog(finalMessage, 'WARN');
      throw new ApplicationError(finalMessage);
    } else {
      finalStatus = AgentExecutorStatus.FAILURE_INTERNAL;
      finalMessage = `Processing stopped unexpectedly after ${iterations} iterations. Last LLM response: ${llmResponseText}`;
      this.logger.warn(finalMessage, { jobId: jobId.value });
      job.addLog(finalMessage, 'ERROR');
      throw new ApplicationError(finalMessage);
    }

    return {
      jobId: jobId.value,
      status: finalStatus,
      message: finalMessage,
      output: finalOutput,
      history: job.getConversationHistory().entries.map(e => e.toPersistence ? e.toPersistence() : e.props),
      errors: currentExecutionHistory.filter(e => e.type.endsWith('_error')),
    };
  }

  private _convertActivityHistoryToLlmMessages(systemMessageContent: string, history: ActivityHistoryVO): LanguageModelMessage[] {
    const messages: LanguageModelMessage[] = [{ role: 'system', content: systemMessageContent }];
    history.entries.forEach(entry => { // Access entries directly
      const role = entry.type; // Use type
      const content = typeof entry.content === 'string' ? entry.content : JSON.stringify(entry.content); // Ensure string content
      const toolCalls = entry.metadata?.tool_calls as LanguageModelMessageToolCall[] | undefined;
      const toolCallId = entry.metadata?.toolCallId as string | undefined;

      if (role === ActivityEntryType.USER) { // Use ActivityEntryType
        messages.push({ role: 'user', content });
      } else if (role === ActivityEntryType.ASSISTANT) { // Use ActivityEntryType
        messages.push({ role: 'assistant', content, tool_calls: toolCalls });
      } else if (role === ActivityEntryType.TOOL_RESULT) { // Use ActivityEntryType
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

    const toolInstance = this.toolRegistryService.getTool(toolName); // Renamed toolResult to toolInstance

    if (!toolInstance) {
      const toolNotFoundError = new ToolError(`Tool '${toolName}' not found.`, toolName, undefined, false);
      this.logger.error(toolNotFoundError.message, { toolName, jobId: executionContext.jobId });
      return { timestamp, type: 'tool_error', name: toolName, error: toolNotFoundError, isCritical: true };
    }
    // const tool = toolInstance; // No need to reassign

    let parsedArgs: unknown;
    try {
      parsedArgs = JSON.parse(toolCall.function.arguments);
    } catch (error: unknown) {
      const parseError = error instanceof Error ? error : new Error(String(error));
      const parsingToolError = new ToolError(`Failed to parse arguments for tool '${toolName}'. Error: ${parseError.message}`, toolName, parseError, true); // Typically recoverable
      this.logger.error(parsingToolError.message, { toolName, args: toolCall.function.arguments, jobId: executionContext.jobId });
      return { timestamp, type: 'tool_error', name: toolName, error: parsingToolError, params: { originalArgs: toolCall.function.arguments }, isCritical: false }; // Mark as not critical
    }

    const validationResult = toolInstance.parameters.safeParse(parsedArgs); // Use toolInstance
    if (!validationResult.success) {
      const validationToolError = new ToolError(`Argument validation failed for tool '${toolName}'.`, toolName, validationResult.error, true); // Typically recoverable
      this.logger.error(validationToolError.message, { toolName, issues: validationResult.error.flatten(), jobId: executionContext.jobId });
      return { timestamp, type: 'tool_error', name: toolName, error: validationToolError, params: parsedArgs, isCritical: false }; // Mark as not critical
    }

    this.logger.info(`Tool call validated: ${toolName} with args: ${JSON.stringify(validationResult.data)}`, { toolName, jobId: executionContext.jobId });

    try {
      const toolExecResult = await toolInstance.execute(validationResult.data, executionContext); // Use toolInstance
      if (toolExecResult.isError()) {
        const toolErrorFromTool = toolExecResult.error;
        this.logger.error(`Tool '${toolName}' execution failed: ${toolErrorFromTool.message}`, { toolError: toolErrorFromTool, jobId: executionContext.jobId });
        return { timestamp, type: 'tool_error', name: toolName, params: validationResult.data, error: toolErrorFromTool, isCritical: !toolErrorFromTool.isRecoverable };
      }
      this.logger.info(`Tool '${toolName}' executed successfully.`, { result: toolExecResult.value, jobId: executionContext.jobId });
      return { timestamp, type: 'tool_result', name: toolName, params: validationResult.data, result: toolExecResult.value }; // Changed type to 'tool_result'
    } catch (error: unknown) {
      const execError = error instanceof Error ? error : new Error(String(error));
      const unexpectedToolError = new ToolError(`Unexpected error during tool '${toolName}' execution: ${execError.message}`, toolName, execError, false);
      this.logger.error(unexpectedToolError.message, { error: unexpectedToolError, jobId: executionContext.jobId });
      return { timestamp, type: 'tool_error', name: toolName, error: unexpectedToolError, params: validationResult.data, isCritical: true };
    }
  }

  private _isGoalAchievedByLlmResponse(responseText: string, toolCalls?: LanguageModelMessageToolCall[]): boolean {
    if (toolCalls && toolCalls.length > 0) return false;
    return responseText.toLowerCase().includes('task complete');
  }

  private _logLlmCall(jobId: string, attempt: number, messages: LanguageModelMessage[]): void {
    this.logger.info(`Calling LLM for Job ID: ${jobId}. Attempt ${attempt}`, {
      jobId: jobId,
      messages: messages.map(m => ({ role: m.role, content: m.content ? String(m.content).substring(0, 100) + '...' : null, tool_calls: m.tool_calls })),
    });
  }

  // This method is no longer part of this service's responsibility.
  // JobWorkerService handles final job state.
  // private _createFinalResult(job: JobEntity<AgentExecutionPayload, JobProcessingOutput>, statusToSet: AgentExecutorStatus, finalMessage: string, outputData?: unknown): JobProcessingOutput { ... }


  private _attemptReplanForUnusableResponse(
    jobId: string,
    assistantMessage: LanguageModelMessage,
    llmResponseText: string,
    currentActivityHistory: ActivityHistoryVO,
    currentExecutionHistory: ExecutionHistoryEntry[], // Pass execution history
    replanAttempts: number,
  ): {
    shouldReplan: boolean;
    updatedHistory?: ActivityHistoryVO;
    updatedExecutionHistory?: ExecutionHistoryEntry[]; // Return updated execution history
    newReplanAttemptCount?: number;
  } {
    if ((!llmResponseText || llmResponseText.length < this.minUsableLlmResponseLength) && (!assistantMessage.tool_calls || assistantMessage.tool_calls.length === 0)) {
      if (replanAttempts < this.maxReplanAttemptsForEmptyResponse) {
        this.logger.warn(`LLM response for Job ID ${jobId} was empty/too short. Attempting re-plan (${replanAttempts + 1}/${this.maxReplanAttemptsForEmptyResponse})`);
        const systemNote = ActivityHistoryEntryVO.create(ActivityEntryType.USER, `System Note: Your previous response was empty or too short (received: "${llmResponseText}"). Please provide a more detailed response or use a tool.`);
        const updatedHistory = currentActivityHistory.addEntry(systemNote);
        const updatedExecutionHistory = [...currentExecutionHistory, { timestamp: new Date(), type: 'unusable_llm_response' as ExecutionHistoryEntry['type'], name: 'LLM Replan Trigger', error: `Empty/short response: ${llmResponseText}` }];
        return { shouldReplan: true, updatedHistory, updatedExecutionHistory, newReplanAttemptCount: replanAttempts + 1 };
      }
      this.logger.warn(`LLM response for Job ID ${jobId} was empty/too short after ${replanAttempts} re-plan attempts. Proceeding with this response.`);
    }
    return { shouldReplan: false, updatedExecutionHistory: currentExecutionHistory, newReplanAttemptCount: replanAttempts }; // Return currentExecutionHistory
  }
}
