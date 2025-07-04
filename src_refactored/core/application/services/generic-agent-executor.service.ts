// src_refactored/core/application/services/generic-agent-executor.service.ts
import { injectable, inject } from 'inversify';

import { ApplicationError } from '@/core/application/common/errors';
import { IAgentExecutor } from '@/core/application/ports/services/i-agent-executor.interface';
import { ILogger, LOGGER_INTERFACE_TYPE } from '@/core/common/services/i-logger.service';
import { Agent } from '@/core/domain/agent/agent.entity';
import { IAgentRepository } from '@/core/domain/agent/ports/agent-repository.interface';
import { AgentId } from '@/core/domain/agent/value-objects/agent-id.vo';
import {
  AgentExecutionPayload,
  ExecutionHistoryEntry,
  AgentExecutorStatus,
  AgentExecutorResult,
  SuccessfulAgentOutput,
} from '@/core/domain/job/job-processing.types';
import { JobEntity } from '@/core/domain/job/job.entity';
import { ActivityHistoryVO } from '@/core/domain/job/value-objects/activity-history.vo';
import { LanguageModelMessage } from '@/core/ports/adapters/llm-adapter.types';

// eslint-disable-next-line boundaries/element-types
import { TYPES } from '@/infrastructure/ioc/types';



import { AgentInteractionService } from './agent-interaction.service';
import { AgentStateService } from './agent-state.service';
import { AgentToolService } from './agent-tool.service';

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
  constructor(
    @inject(TYPES.IAgentRepository) private readonly agentRepository: IAgentRepository,
    @inject(LOGGER_INTERFACE_TYPE) private readonly logger: ILogger,
    @inject(AgentInteractionService) private readonly agentInteractionService: AgentInteractionService,
    @inject(AgentToolService) private readonly agentToolService: AgentToolService,
    @inject(AgentStateService) private readonly agentStateService: AgentStateService,
  ) {}

  public async process(
    job: JobEntity<AgentExecutionPayload, unknown>
  ): Promise<AgentExecutorResult<SuccessfulAgentOutput>> {
    const jobId = job.id.value;
    const agentId = job.props.payload.agentId;

    this.logger.info(`Processing Job ID: ${jobId} with Agent ID: ${agentId}`, { jobId, agentId });

    const agent = await this._fetchAgent(agentId, job);

    const executionState = this.agentStateService.initializeExecutionState(job, agent);

    this.logger.info(`Job ID: ${jobId} processing attempt: ${job.attemptsMade}`);
    job.updateProgress(10);
    this.logger.info(`Max iterations for Job ID: ${jobId} set to ${executionState.maxIterations}`);

    await this._executionLoop(job, agent, executionState);

    return this._constructFinalResult(job, executionState);
  }

  private async _executionLoop(
    job: JobEntity<AgentExecutionPayload, unknown>,
    agent: Agent,
    executionState: ExecutionState
  ): Promise<void> {
    while (this._shouldContinueExecution(executionState)) {
      executionState.iterations++;
      this.logger.info(`Starting LLM interaction cycle ${executionState.iterations} for Job ID: ${job.id.value}`);
      job.updateProgress(10 + (80 * executionState.iterations) / executionState.maxIterations);

      await this.agentInteractionService.performLlmInteraction(job, agent, executionState);

      if (executionState.criticalErrorEncounteredThisTurn) break;

      if (executionState.assistantMessage?.tool_calls && executionState.assistantMessage.tool_calls.length > 0) {
        await this.agentToolService.handleToolCallsIfPresent(job, agent, executionState);
      }

      if (executionState.criticalErrorEncounteredThisTurn) break;

      this.agentStateService.checkGoalAchieved(executionState);

      if (this._handleEndOfLoopConditions(job, executionState)) break;
    }
  }

  private _shouldContinueExecution(state: ExecutionState): boolean {
    return state.iterations < state.maxIterations && !state.goalAchieved && !state.criticalErrorEncounteredThisTurn;
  }

  private _handleEndOfLoopConditions(job: JobEntity<AgentExecutionPayload, unknown>, executionState: ExecutionState): boolean {
    if (executionState.goalAchieved) {
      this.logger.info(`Goal achieved for Job ID: ${job.id.value} in iteration ${executionState.iterations}.`);
      return true;
    }
    if (executionState.iterations >= executionState.maxIterations) {
      this.logger.info(`Max iterations reached for Job ID: ${job.id.value}.`);
      return true;
    }
    return false;
  }

  private async _fetchAgent(agentIdString: string, job: JobEntity<AgentExecutionPayload, unknown>): Promise<Agent> {
    const agentIdVo = AgentId.fromString(agentIdString);
    const agent = await this.agentRepository.findById(agentIdVo);

    if (!agent) {
      const message = `Agent with ID ${agentIdString} not found.`;
      this.logger.error(message);
      job.addLog(message, 'ERROR');
      throw new ApplicationError(message);
    }
    return agent;
  }

  private _constructFinalResult(
    job: JobEntity<AgentExecutionPayload, unknown>,
    state: ExecutionState,
  ): AgentExecutorResult<SuccessfulAgentOutput> {
    if (state.goalAchieved) {
      return this._createJobProcessingOutput(job, state, AgentExecutorStatus.SUCCESS, `Goal achieved. Last LLM response: ${state.llmResponseText}`);
    }
    if (state.criticalErrorEncounteredThisTurn) {
      const lastErrorEntry = state.executionHistory.slice().reverse().find((entry) => entry.type.endsWith('_error'));
      const errorMessage = lastErrorEntry?.error ? String(lastErrorEntry.error) : 'Unknown critical error';
      const finalMessage = `Processing stopped due to a critical error after ${state.iterations} iterations. Error: ${errorMessage}`;
      job.addLog(finalMessage, 'ERROR');
      throw new ApplicationError(finalMessage);
    }
    if (state.iterations >= state.maxIterations) {
      const finalMessage = `Max iterations (${state.maxIterations}) reached. Goal not achieved. Last LLM response: ${state.llmResponseText}`;
      job.addLog(finalMessage, 'WARN');
      throw new ApplicationError(finalMessage);
    }

    const finalMessage = `Processing stopped unexpectedly after ${state.iterations} iterations. Last LLM response: ${state.llmResponseText}`;
    this.logger.warn(finalMessage, { jobId: job.id.value });
    job.addLog(finalMessage, 'ERROR');
    throw new ApplicationError(finalMessage);
  }

  private _createJobProcessingOutput(
    job: JobEntity<AgentExecutionPayload, unknown>,
    state: ExecutionState,
    status: AgentExecutorStatus,
    message: string,
  ): AgentExecutorResult<SuccessfulAgentOutput> {
    let successfulOutput: SuccessfulAgentOutput | undefined;
    if (status === AgentExecutorStatus.SUCCESS) {
      job.updateProgress(100);
      successfulOutput = {
        message: state.llmResponseText,
        history: this._getSerializableHistory(job),
      };
    }

    return {
      jobId: job.id.value,
      status,
      message,
      output: successfulOutput,
      errors: state.executionHistory.filter((entry) => entry.type.endsWith('_error')),
    };
  }

  private _getSerializableHistory(job: JobEntity<AgentExecutionPayload, unknown>) {
    return job.conversationHistory.toPersistence().entries;
  }
}