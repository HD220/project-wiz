import { Agent } from '@/core/domain/agent/agent.entity';
import { DomainError } from '@/core/domain/common/errors'; // Corrected path
import { JobProcessingOutput } from '@/core/domain/job/job-processing.types'; // Corrected type
import { JobEntity } from '@/core/domain/job/job.entity'; // Corrected type


import { ApplicationError } from '@/application/common/errors';

import { Result } from '@/shared/result';

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
   *          On failure, it contains a DomainError or ApplicationError.
   */
  executeJob(
    job: JobEntity, // Corrected type
    agent: Agent
  ): Promise<Result<JobProcessingOutput, DomainError | ApplicationError>>; // Corrected type
}
