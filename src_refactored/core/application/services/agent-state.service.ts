import { injectable, inject } from 'inversify';

import { ILogger, LOGGER_INTERFACE_TYPE } from '@/core/common/services/i-logger.service';
import { Agent } from '@/core/domain/agent/agent.entity';
import { AgentExecutionPayload, ExecutionHistoryEntry } from '@/core/domain/job/job-processing.types';
import { JobEntity } from '@/core/domain/job/job.entity';
import { ActivityHistoryVO, ActivityHistoryEntryVO, ActivityEntryType } from '@/core/domain/job/value-objects/activity-history.vo';
import { LanguageModelMessage, LanguageModelMessageToolCall } from '@/core/ports/adapters/llm-adapter.types';

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
export class AgentStateService {
  constructor(
    @inject(LOGGER_INTERFACE_TYPE) private readonly logger: ILogger,
  ) {}

  public initializeExecutionState(job: JobEntity<AgentExecutionPayload, unknown>, agent: Agent): ExecutionState {
    const { currentActivityHistory, currentExecutionHistory } = this._initializeHistories(job, job.payload);
    return {
      goalAchieved: false,
      iterations: 0,
      maxIterations: agent.maxIterations.value,
      llmResponseText: 'No response yet.',
      assistantMessage: null,
      replanAttemptsForEmptyResponse: 0,
      criticalErrorEncounteredThisTurn: false,
      activityHistory: currentActivityHistory,
      executionHistory: currentExecutionHistory,
    };
  }

  private _initializeHistories(job: JobEntity<AgentExecutionPayload, unknown>, jobPayload: AgentExecutionPayload): { currentActivityHistory: ActivityHistoryVO; currentExecutionHistory: ExecutionHistoryEntry[] } {
    let activityHistory = job.conversationHistory;
    if (activityHistory.entries.length === 0) {
      const userPromptContent = jobPayload.initialPrompt || `Based on your persona, please address the following task: ${job.name}`;
      const userPromptEntry = ActivityHistoryEntryVO.create(ActivityEntryType.LLM_REQUEST, userPromptContent);
      job.addConversationEntry(userPromptEntry);
      activityHistory = job.conversationHistory;
    }
    return { currentActivityHistory: activityHistory, currentExecutionHistory: [...job.getExecutionHistory()] };
  }

  public checkGoalAchieved(state: ExecutionState): void {
    if (!state.criticalErrorEncounteredThisTurn) {
      state.goalAchieved = this._isGoalAchievedByLlmResponse(
        state.llmResponseText,
        state.assistantMessage?.tool_calls as LanguageModelMessageToolCall[] | undefined,
      );
    }
  }

  private _isGoalAchievedByLlmResponse(responseText: string, toolCalls?: LanguageModelMessageToolCall[]): boolean {
    if (toolCalls && toolCalls.length > 0) {
      return false;
    }
    return responseText.toLowerCase().includes('task complete');
  }
}
