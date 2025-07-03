
import { AgentExecutionPayload, AgentExecutorResult, SuccessfulAgentOutput } from '@/core/domain/job/job-processing.types';
import { JobEntity } from '@/core/domain/job/job.entity';

/**
 * @interface IAgentExecutor
 * @description Defines the contract for an agent executor, which is responsible for
 * processing a job using a specific agent and available tools.
 */
export interface IAgentExecutor {
  /**
   * Executes a given job using the specified agent.
   * The executor will manage the interaction loop with an LLM,
   * tool invocations, history management, and state updates for the job.
   *
   * @param {JobEntity} job - The job entity to be processed.
   * @returns {Promise<AgentExecutorResult<SuccessfulAgentOutput>>}
   *          A promise that resolves with the AgentExecutorResult.
   *          Errors are expected to be thrown.
   */
  process(
    job: JobEntity<AgentExecutionPayload, unknown>
  ): Promise<AgentExecutorResult<SuccessfulAgentOutput>>;
}
