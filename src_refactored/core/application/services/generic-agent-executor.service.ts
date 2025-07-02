// src_refactored/core/application/services/generic-agent-executor.service.ts
import { injectable, inject } from 'inversify';

import { ApplicationError } from '@/core/application/common/errors';
import { IAgentExecutor } from '@/core/application/ports/services/i-agent-executor.interface';
import { ILogger, LOGGER_INTERFACE_TYPE } from '@/core/common/services/i-logger.service';
import { Agent } from '@/core/domain/agent/agent.entity';
import { IAgentRepository } from '@/core/domain/agent/ports/agent-repository.interface';
import { AgentId } from '@/core/domain/agent/value-objects/agent-id.vo';
import {
  JobProcessingOutput, // Will be removed from process method return type
  AgentExecutionPayload,
  ExecutionHistoryEntry,
  AgentExecutorStatus,
  AgentExecutorResult, // Added
  SuccessfulAgentOutput, // Added
} from '@/core/domain/job/job-processing.types';
import { JobEntity } from '@/core/domain/job/job.entity';
import { ActivityHistoryVO } from '@/core/domain/job/value-objects/activity-history.vo';
import { LanguageModelMessage } from '@/core/ports/adapters/llm-adapter.types';

// eslint-disable-next-line boundaries/element-types
import { TYPES } from '@/infrastructure/ioc/types';

import { Result, ok, error as resultError, isError } from '@/shared/result';

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

  // Removed erroneous import and class re-declaration that was here

  public async process(
    job: JobEntity<AgentExecutionPayload, unknown> // Changed R to unknown
  ): Promise<AgentExecutorResult<SuccessfulAgentOutput>> { // Changed return type
    const jobPayload = job.getProps().payload;
    const agentId = jobPayload.agentId;
    const jobId = job.id(); // Get the JobIdVO instance

    this.logger.info(`Processing Job ID: ${jobId.value()} with Agent ID: ${agentId}`, { jobId: jobId.value(), agentId });

    const agentFetchResult = await this._fetchAgent(agentId, job);
    if (isError(agentFetchResult)) {
        // agentFetchResult.error is already ApplicationError due to _fetchAgent's return type
        const appError: ApplicationError = agentFetchResult.error;
        const errorMessage = appError.message || `Failed to fetch agent ${String(agentId)}`;
        this.logger.error(
            `[GenericAgentExecutor] Critical error fetching agent ${String(agentId)}: ${errorMessage}`,
            appError.cause, // Pass cause as second arg
            { component: 'GenericAgentExecutor', operation: '_fetchAgent', agentId: String(agentId), jobId: jobId.value() } // Meta
        );
        job.addLog(`Critical error fetching agent: ${errorMessage}`, 'ERROR');
        throw appError;
    }
    const agent = agentFetchResult.value;

    // job's R type is unknown here, which is compatible with initializeExecutionState's expected input after its signature change
    const executionState = this.agentStateService.initializeExecutionState(job, agent);

    this.logger.info(`Job ID: ${jobId.value()} processing attempt: ${job.getProps().attemptsMade}`);
    job.updateProgress(10);
    this.logger.info(`Max iterations for Job ID: ${jobId.value} set to ${executionState.maxIterations}`);

    await this._executionLoop(job, agent, executionState);

    return this._constructFinalResult(job, executionState);
  }

  private async _executionLoop(
    job: JobEntity<AgentExecutionPayload, unknown>, // Changed R to unknown
    agent: Agent,
    executionState: ExecutionState
  ): Promise<void> {
    while (this._shouldContinueExecution(executionState)) {
      executionState.iterations++;
      this.logger.info(`Starting LLM interaction cycle ${executionState.iterations} for Job ID: ${job.id().value()}`);
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

  private _handleEndOfLoopConditions(job: JobEntity<AgentExecutionPayload, unknown>, executionState: ExecutionState): boolean { // Changed R to unknown
    if (executionState.goalAchieved) {
      this.logger.info(`Goal achieved for Job ID: ${job.id().value()} in iteration ${executionState.iterations}.`);
      return true;
    }
    if (executionState.iterations >= executionState.maxIterations) {
      this.logger.info(`Max iterations reached for Job ID: ${job.id().value()}.`);
      return true;
    }
    return false;
  }

  private async _fetchAgent(agentIdString: string, job: JobEntity<AgentExecutionPayload, unknown>): Promise<Result<Agent, ApplicationError>> { // Changed R to unknown
    try {
      const agentIdVo = AgentId.fromString(agentIdString); // Changed from create to fromString
      const agentResult = await this.agentRepository.findById(agentIdVo);

      if (isError(agentResult)) {
        const message = `Error fetching agent ${agentIdString} from repository.`;
        const cause = agentResult.error instanceof Error ? agentResult.error : new Error(String(agentResult.error));
        this.logger.error(message, cause, { additionalContext: "Agent repository findById error" });
        job.addLog(message, 'ERROR');
        return resultError(new ApplicationError(message, cause));
      }

      if (!agentResult.value) {
        const message = `Agent with ID ${agentIdString} not found.`;
        this.logger.error(message); // No error object to pass as cause
        job.addLog(message, 'ERROR');
        return resultError(new ApplicationError(message));
      }
      return ok(agentResult.value);
    } catch (caughtError) {
      const message = `Invalid Agent ID format for ${agentIdString}.`;
      const err = caughtError instanceof Error ? caughtError : new Error(String(caughtError));
      this.logger.error(message, err, { additionalContext: "Agent ID format error" });
      job.addLog(message, 'ERROR');
      return resultError(new ApplicationError(message, err));
    }
  }

  private _constructFinalResult(
    job: JobEntity<AgentExecutionPayload, unknown>,
    state: ExecutionState,
  ): AgentExecutorResult<SuccessfulAgentOutput> { // Changed return type
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
    this.logger.warn(finalMessage, { jobId: job.id().value() });
    job.addLog(finalMessage, 'ERROR');
    throw new ApplicationError(finalMessage);
  }

  private _createJobProcessingOutput(
    job: JobEntity<AgentExecutionPayload, unknown>, // R type changed to unknown
    state: ExecutionState,
    status: AgentExecutorStatus,
    message: string,
  ): AgentExecutorResult<SuccessfulAgentOutput> { // Return type changed
    let successfulOutput: SuccessfulAgentOutput | undefined;
    if (status === AgentExecutorStatus.SUCCESS) {
      job.updateProgress(100);
      successfulOutput = {
        message: state.llmResponseText,
        history: this._getSerializableHistory(job),
      };
    }

    return {
      jobId: job.id().value(),
      status,
      message,
      output: successfulOutput,
      errors: state.executionHistory.filter((entry) => entry.type.endsWith('_error')),
    };
  }

  private _getSerializableHistory(job: JobEntity<AgentExecutionPayload, unknown>) { // R type changed
    // ActivityHistoryVO.toPersistence() returns an object like { entries: SerializedEntry[], maxEntries?: number }
    // We want just the array of serialized entries.
    return job.getConversationHistory().toPersistence().entries;
  }
}
