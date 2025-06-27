import { Agent } from '@/core/domain/agent/agent.entity';
import { Job } from '@/core/domain/job/job.entity';

import { AgentExecutorResult } from '@/core/domain/job/job-processing.types';
import { Result } from '@/shared/result';
import { DomainError } from '@/domain/common/errors';
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
   * @param {Job} job - The job entity to be processed.
   * @param {Agent} agent - The agent entity that will process the job.
   * @returns {Promise<Result<AgentExecutorResult, DomainError | ApplicationError>>}
   *          A promise that resolves with a Result object.
   *          On success, it contains the AgentExecutorResult.
   *          On failure, it contains a DomainError or ApplicationError.
   */
  executeJob(
    job: Job,
    agent: Agent
  ): Promise<Result<AgentExecutorResult, DomainError | ApplicationError>>;
}
