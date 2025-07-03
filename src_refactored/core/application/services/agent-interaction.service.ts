import { injectable, inject } from 'inversify';

import { ApplicationError } from '@/core/application/common/errors';
import { ILogger, LOGGER_INTERFACE_TYPE } from '@/core/common/services/i-logger.service';
import { Agent } from '@/core/domain/agent/agent.entity';
import { AgentExecutionPayload, JobProcessingOutput, ExecutionHistoryEntry } from '@/core/domain/job/job-processing.types';
import { JobEntity } from '@/core/domain/job/job.entity';
import { ActivityHistoryVO, ActivityHistoryEntryVO, ActivityEntryType } from '@/core/domain/job/value-objects/activity-history.vo';
import { JobIdVO } from '@/core/domain/job/value-objects/job-id.vo';
import { ILLMAdapter, ILLMAdapterToken } from '@/core/ports/adapters/llm-adapter.interface';
import { LanguageModelMessage, LanguageModelMessageToolCall } from '@/core/ports/adapters/llm-adapter.types';

import { isError } from '@/shared/result';

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
export class AgentInteractionService {
  private readonly minUsableLlmResponseLength = 10;
  private readonly maxReplanAttemptsForEmptyResponse = 1;

  constructor(
    @inject(ILLMAdapterToken) private readonly llmAdapter: ILLMAdapter,
    @inject(LOGGER_INTERFACE_TYPE) private readonly logger: ILogger,
  ) {}

  public async performLlmInteraction(
    job: JobEntity<AgentExecutionPayload, unknown>,
    agent: Agent,
    state: ExecutionState,
  ): Promise<void> {
    const systemMessageString = `You are ${agent.personaTemplate.name.value}, a ${
      agent.personaTemplate.role.value
    }. Your goal is: ${agent.personaTemplate.goal.value}. Persona backstory: ${agent.personaTemplate.backstory.value}`;
    const conversationMessages = this.convertActivityHistoryToLlmMessages(systemMessageString, state.activityHistory);

    this.logLlmCall(job.id.value, job.attemptsMade, conversationMessages);
    job.addLog(`Calling LLM (iteration ${state.iterations}) for job ${job.id.value} (attempt ${job.attemptsMade + 1})`, 'DEBUG');
    // TODO: Consider how to log the detailed message content if necessary, perhaps via logger.debug directly.

    const llmGenerationResult = await this.llmAdapter.generateText(conversationMessages, {
      temperature: agent.temperature.value,
    });

    if (isError(llmGenerationResult)) {
      const llmError = llmGenerationResult.error;
      const errorMessage = `LLM generation failed in iteration ${state.iterations}. Error: ${llmError.message}`;
      const jobIdVo: JobIdVO = job.id;
      this.logger.error(errorMessage, llmError, { jobId: jobIdVo.value });
      const historyEntry: ExecutionHistoryEntry = { timestamp: new Date(), type: 'llm_error', name: 'LLM Generation', error: llmError.message };
      job.addExecutionHistoryEntry(historyEntry);
      throw new ApplicationError(errorMessage, llmError);
    }

    state.assistantMessage = llmGenerationResult.value;
    state.llmResponseText = state.assistantMessage.content || '';
    const currentJobIdVal = job.id.value;
    this.logger.info(
      `LLM response (iteration ${state.iterations}) for Job ID: ${currentJobIdVal}: ${state.llmResponseText.substring(0, 100)}...`,
    );
    job.addLog(`LLM Response (iteration ${state.iterations}): ${state.llmResponseText.substring(0, 100)}...`, 'DEBUG');

    if (this._isUnusableResponse(state)) {
      if (this._canReplan(state)) {
        this._attemptReplan(job, state);
        return;
      }
      this.logger.warn(
        `LLM response for Job ID ${job.id.value} was empty/too short after ${state.replanAttemptsForEmptyResponse} re-plan attempts. Proceeding with this response.`,
      );
    }

    const assistantHistoryEntry = ActivityHistoryEntryVO.create(ActivityEntryType.LLM_RESPONSE, state.assistantMessage.content || '', {
      tool_calls: state.assistantMessage.tool_calls as LanguageModelMessageToolCall[] | undefined,
    });
    job.addConversationEntry(assistantHistoryEntry);
    state.activityHistory = job.conversationHistory;
  }

  private _isUnusableResponse(state: ExecutionState): boolean {
    return (!state.llmResponseText || state.llmResponseText.length < this.minUsableLlmResponseLength) &&
           (!state.assistantMessage?.tool_calls || state.assistantMessage.tool_calls.length === 0);
  }

  private _canReplan(state: ExecutionState): boolean {
    return state.replanAttemptsForEmptyResponse < this.maxReplanAttemptsForEmptyResponse;
  }

  private _attemptReplan(job: JobEntity<AgentExecutionPayload, unknown>, state: ExecutionState): void {
    this.logger.warn(
      `LLM response for Job ID ${job.id.value} was empty/too short. Attempting re-plan (${state.replanAttemptsForEmptyResponse +
        1}/${this.maxReplanAttemptsForEmptyResponse})`,
    );
    const systemNote = ActivityHistoryEntryVO.create(
      ActivityEntryType.SYSTEM_MESSAGE,
      `System Note: Your previous response was empty or too short (received: "${state.llmResponseText}"). Please provide a more detailed response or use a tool.`,
    );
    const updatedHistory = state.activityHistory.addEntry(systemNote);
    const updatedExecutionHistory = [
      ...state.executionHistory,
      {
        timestamp: new Date(),
        type: 'unusable_llm_response' as ExecutionHistoryEntry['type'],
        name: 'LLM Replan Trigger',
        error: `Empty/short response: ${state.llmResponseText}`,
      },
    ];

    job.setConversationHistory(updatedHistory);
    job.setExecutionHistory(updatedExecutionHistory);
    state.activityHistory = job.conversationHistory;
    state.executionHistory = [...job.executionHistory];
    state.replanAttemptsForEmptyResponse++;
    job.addLog(`LLM response was unusable. Re-planning (attempt ${state.replanAttemptsForEmptyResponse}).`, 'WARN');
  }

  public convertActivityHistoryToLlmMessages(systemMessageContent: string, history: ActivityHistoryVO): LanguageModelMessage[] {
    const messages: LanguageModelMessage[] = [{ role: 'system', content: systemMessageContent }];
    history.entries.forEach((entry: ActivityHistoryEntryVO) => {
      const role = entry.type;
      const content = typeof entry.content === 'string' ? entry.content : JSON.stringify(entry.content);
      const toolCalls = entry.metadata?.tool_calls as LanguageModelMessageToolCall[] | undefined;
      const toolCallId = entry.metadata?.toolCallId as string | undefined;

      if (role === ActivityEntryType.SYSTEM_MESSAGE || role === ActivityEntryType.LLM_REQUEST || role === ActivityEntryType.OBSERVATION || role === ActivityEntryType.THOUGHT) {
        messages.push({ role: 'user', content });
      } else if (role === ActivityEntryType.LLM_RESPONSE) {
        messages.push({ role: 'assistant', content, tool_calls: toolCalls });
      } else if (role === ActivityEntryType.TOOL_RESULT) {
        if (toolCallId) {
          messages.push({ role: 'tool', tool_call_id: toolCallId, content });
        } else {
          this.logger.warn('Tool result entry missing toolCallId, skipping conversion to LLM message.');
        }
      }
    });
    return messages;
  }

  public logLlmCall(jobIdValue: string, attempt: number, messages: LanguageModelMessage[]): void {
    this.logger.info(`Calling LLM for Job ID: ${jobIdValue}. Attempt ${attempt + 1}`, {
      jobId: jobIdValue,
      messages: messages.map((message: LanguageModelMessage) => ({
        role: message.role,
        content: message.content ? String(message.content).substring(0, 100) + '...' : null,
        tool_calls: message.tool_calls,
      })),
    });
  }
}
