// src/core/domain/entities/jobs/job-runtime-data.interface.ts

import { AgentJobState } from '../job-processing.types';

export interface JobRuntimeData {
  /**
   * Stores the state specific to an agent's execution for this job.
   * This includes conversation history, execution history, etc.
   */
  agentState?: AgentJobState;

  /**
   * A summary of the last failure encountered by the agent while processing this job.
   * Useful for providing context for retries or re-planning.
   */
  lastFailureSummary?: string;

  /**
   * General-purpose field to store error information related to job processing,
   * typically set by the WorkerService or the Job entity itself upon failure.
   */
  error?: any;

  /**
   * Allows for other dynamic runtime properties if needed, though specific known properties are preferred.
   */
  [key: string]: any;
}
