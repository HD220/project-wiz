import { Agent } from '@/core/domain/agent/agent.entity';
// Corrected path
import { DomainError } from '@/core/domain/common/errors';
// Corrected type
import { AgentExecutionPayload, AgentExecutorResult, SuccessfulAgentOutput } from '@/core/domain/job/job-processing.types';
// Corrected type
import { JobEntity } from '@/core/domain/job/job.entity';


import { ApplicationError } from '@/application/common/errors';



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
   * @param {Agent} agent - The agent entity that will process the job.
   * @returns {Promise<Result<JobProcessingOutput, DomainError | ApplicationError>>}
   *          A promise that resolves with a Result object.
   *          On success, it contains the JobProcessingOutput.
   *          Errors are expected to be thrown.
   */
  process(
    job: JobEntity<AgentExecutionPayload, unknown>
  ): Promise<AgentExecutorResult<SuccessfulAgentOutput>>;
}
