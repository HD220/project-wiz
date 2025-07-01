import { injectable, inject } from 'inversify';

import { ILogger, LOGGER_INTERFACE_TYPE } from '@/core/common/services/i-logger.service';
import { Agent } from '@/core/domain/agent/agent.entity';
import { ToolError } from '@/core/domain/common/errors';
import { AgentExecutionPayload, JobProcessingOutput, ExecutionHistoryEntry } from '@/core/domain/job/job-processing.types';
import { JobEntity } from '@/core/domain/job/job.entity';
import { ActivityHistoryVO, ActivityHistoryEntryVO, ActivityEntryType } from '@/core/domain/job/value-objects/activity-history.vo';
import { LanguageModelMessageToolCall } from '@/core/ports/adapters/llm-adapter.types';
import { IToolExecutionContext } from '@/core/tools/tool.interface';

import { ToolValidationService } from './tool-validation.service';

interface ExecutionState {
  goalAchieved: boolean;
  iterations: number;
  maxIterations: number;
  llmResponseText: string;
  assistantMessage: LanguageModelMessageToolCall | null;
  replanAttemptsForEmptyResponse: number;
  criticalErrorEncounteredThisTurn: boolean;
  activityHistory: ActivityHistoryVO;
  executionHistory: ExecutionHistoryEntry[];
}

@injectable()
export class AgentToolService {
  constructor(
    @inject(LOGGER_INTERFACE_TYPE) private readonly logger: ILogger,
    @inject(ToolValidationService) private readonly toolValidationService: ToolValidationService,
  ) {}

  public async handleToolCallsIfPresent(
    job: JobEntity<AgentExecutionPayload, JobProcessingOutput>,
    agent: Agent,
    state: ExecutionState,
  ): Promise<void> {
    if (state.assistantMessage?.tool_calls && state.assistantMessage.tool_calls.length > 0) {
      await this.processToolCalls(job, agent, state, state.assistantMessage.tool_calls);
    }
  }

  private async processToolCalls(
    job: JobEntity<AgentExecutionPayload, JobProcessingOutput>,
    agent: Agent,
    state: ExecutionState,
    toolCalls: LanguageModelMessageToolCall[],
  ): Promise<void> {
    this.logger.info(`LLM requested ${toolCalls.length} tool calls for Job ID: ${job.id.value}`);
    job.addLog(`LLM requesting ${toolCalls.length} tool calls.`, 'DEBUG');

    for (const toolCall of toolCalls) {
      const executionEntry = await this._executeSingleToolCall(toolCall, agent, job);
      job.addExecutionHistoryEntry(executionEntry);
      state.executionHistory.push(executionEntry);

      if (this._isCriticalToolError(executionEntry, state, job)) {
        break;
      }
      this._addToolResultToConversation(job, executionEntry, toolCall);
    }
    state.activityHistory = job.getConversationHistory();
  }

  private async _executeSingleToolCall(
    toolCall: LanguageModelMessageToolCall,
    agent: Agent,
    job: JobEntity<AgentExecutionPayload, JobProcessingOutput>,
  ): Promise<ExecutionHistoryEntry> {
    const executionContext: IToolExecutionContext = {
      agentId: agent.id.value,
      jobId: job.id.value,
      userId: job.payload.userId,
    };
    // Delegate to ToolValidationService
    return this.toolValidationService.processAndValidateSingleToolCall(toolCall, executionContext);
  }

  private _isCriticalToolError(
    executionEntry: ExecutionHistoryEntry,
    state: ExecutionState,
    job: JobEntity<AgentExecutionPayload, JobProcessingOutput>,
  ): boolean {
    if (executionEntry.type === 'tool_error' && executionEntry.error instanceof ToolError) {
      const toolError = executionEntry.error;
      job.addLog(`Tool '${toolError.toolName || executionEntry.name}' error: ${toolError.message}`, 'ERROR', {
        isRecoverable: toolError.isRecoverable,
      });
      if (!toolError.isRecoverable) {
        state.criticalErrorEncounteredThisTurn = true;
        this.logger.error(
          `Critical tool error for Job ID ${job.id.value}: Tool '${toolError.toolName ||
            executionEntry.name}' failed non-recoverably.`,
          toolError,
        );
        return true;
      }
    }
    return false;
  }

  private _addToolResultToConversation(
    job: JobEntity<AgentExecutionPayload, JobProcessingOutput>,
    executionEntry: ExecutionHistoryEntry,
    toolCall: LanguageModelMessageToolCall,
  ): void {
    let toolResultContent: string | object;
    if (executionEntry.type === 'tool_error' && executionEntry.error) {
      const errDetails =
        executionEntry.error instanceof ToolError
          ? {
              name: executionEntry.error.name,
              message: executionEntry.error.message,
              toolName: executionEntry.error.toolName,
              isRecoverable: executionEntry.error.isRecoverable,
            }
          : { message: String(executionEntry.error) };
      toolResultContent = errDetails;
    } else {
      toolResultContent = executionEntry.result as object;
    }
    const toolResultActivityEntry = ActivityHistoryEntryVO.create(ActivityEntryType.TOOL_RESULT, toolResultContent, {
      toolName: executionEntry.name,
      toolCallId: toolCall.id,
    });
    job.addConversationEntry(toolResultActivityEntry);
  }
}
