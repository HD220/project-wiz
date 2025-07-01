import { injectable, inject } from 'inversify';

import { ApplicationError } from '@/core/application/common/errors';
import { ILogger, LOGGER_INTERFACE_TYPE } from '@/core/common/services/i-logger.service';
import { Agent } from '@/core/domain/agent/agent.entity';
import { AgentExecutionPayload, JobProcessingOutput, ExecutionHistoryEntry } from '@/core/domain/job/job-processing.types';
import { JobEntity } from '@/core/domain/job/job.entity';
import { ActivityHistoryVO, ActivityHistoryEntryVO, ActivityEntryType } from '@/core/domain/job/value-objects/activity-history.vo';
import { ILLMAdapter, ILLMAdapterToken, LanguageModelMessage, LanguageModelMessageToolCall } from '@/core/ports/adapters/llm-adapter.interface';

// Re-define ExecutionState or import if it becomes a shared type
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
    job: JobEntity<AgentExecutionPayload, JobProcessingOutput>,
    agent: Agent,
    state: ExecutionState,
  ): Promise<void> {
    const persona = agent.personaTemplate;
    const systemMessageString = `You are ${persona.name.value}, a ${
      persona.role.value
    }. Your goal is: ${persona.goal.value}. Persona backstory: ${persona.backstory.value()}`;
    const conversationMessages = this._convertActivityHistoryToLlmMessages(systemMessageString, state.activityHistory);

    this._logLlmCall(job.id.value, job.attemptsMade, conversationMessages);
    job.addLog(`Calling LLM (iteration ${state.iterations})`, 'DEBUG', {
      messages: conversationMessages.map((message) => ({
        role: message.role,
        content: message.content ? String(message.content).substring(0, 50) + '...' : null,
      })),
    });

    const llmGenerationResult = await this.llmAdapter.generateText(conversationMessages, {
      temperature: agent.temperature.value,
    });

    if (llmGenerationResult.isError()) {
      const llmError = llmGenerationResult.error;
      const errorMessage = `LLM generation failed in iteration ${state.iterations}. Error: ${llmError.message}`;
      this.logger.error(errorMessage, llmError, { jobId: job.id.value });
      job.addExecutionHistoryEntry({ timestamp: new Date(), type: 'llm_error', name: 'LLM Generation', error: llmError.message });
      throw new ApplicationError(errorMessage, llmError);
    }

    state.assistantMessage = llmGenerationResult.value;
    state.llmResponseText = state.assistantMessage.content || '';
    this.logger.info(
      `LLM response (iteration ${state.iterations}) for Job ID: ${job.id.value}: ${state.llmResponseText.substring(0, 100)}...`,
    );
    job.addLog(`LLM Response (iteration ${state.iterations}): ${state.llmResponseText.substring(0, 100)}...`, 'DEBUG');

    if (this._isUnusableResponse(state)) {
      if (this._canReplan(state)) {
        this._attemptReplan(job, state);
        // Indicate that a replan was attempted and the current interaction should yield
        return;
      }
      this.logger.warn(
        `LLM response for Job ID ${job.id.value} was empty/too short after ${state.replanAttemptsForEmptyResponse} re-plan attempts. Proceeding with this response.`,
      );
    }

    const assistantHistoryEntry = ActivityHistoryEntryVO.create(ActivityEntryType.ASSISTANT, state.assistantMessage.content || '', {
      tool_calls: state.assistantMessage.tool_calls as LanguageModelMessageToolCall[] | undefined,
    });
    job.addConversationEntry(assistantHistoryEntry);
    state.activityHistory = job.getConversationHistory();
  }

  private _isUnusableResponse(state: ExecutionState): boolean {
    return (!state.llmResponseText || state.llmResponseText.length < this.minUsableLlmResponseLength) &&
           (!state.assistantMessage?.tool_calls || state.assistantMessage.tool_calls.length === 0);
  }

  private _canReplan(state: ExecutionState): boolean {
    return state.replanAttemptsForEmptyResponse < this.maxReplanAttemptsForEmptyResponse;
  }

  private _attemptReplan(job: JobEntity<AgentExecutionPayload, JobProcessingOutput>, state: ExecutionState): void {
    this.logger.warn(
      `LLM response for Job ID ${job.id.value} was empty/too short. Attempting re-plan (${state.replanAttemptsForEmptyResponse +
        1}/${this.maxReplanAttemptsForEmptyResponse})`,
    );
    const systemNote = ActivityHistoryEntryVO.create(
      ActivityEntryType.USER,
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
    state.activityHistory = job.getConversationHistory();
    state.executionHistory = [...job.getExecutionHistory()];
    state.replanAttemptsForEmptyResponse++;
    job.addLog(`LLM response was unusable. Re-planning (attempt ${state.replanAttemptsForEmptyResponse}).`, 'WARN');
  }

  public convertActivityHistoryToLlmMessages(systemMessageContent: string, history: ActivityHistoryVO): LanguageModelMessage[] {
    const messages: LanguageModelMessage[] = [{ role: 'system', content: systemMessageContent }];
    history.entries.forEach((entry) => {
      const role = entry.type;
      const content = typeof entry.content === 'string' ? entry.content : JSON.stringify(entry.content);
      const toolCalls = entry.metadata?.tool_calls as LanguageModelMessageToolCall[] | undefined;
      const toolCallId = entry.metadata?.toolCallId as string | undefined;

      if (role === ActivityEntryType.USER) {
        messages.push({ role: 'user', content });
      } else if (role === ActivityEntryType.ASSISTANT) {
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

  public logLlmCall(jobId: string, attempt: number, messages: LanguageModelMessage[]): void {
    this.logger.info(`Calling LLM for Job ID: ${jobId}. Attempt ${attempt}`, {
      jobId: jobId,
      messages: messages.map((message) => ({
        role: message.role,
        content: message.content ? String(message.content).substring(0, 100) + '...' : null,
        tool_calls: message.tool_calls,
      })),
    });
  }
}
