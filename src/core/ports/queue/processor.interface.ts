// src/core/ports/queue/processor.interface.ts

import { Job } from '../../domain/entities/jobs/job.entity';

/**
 * Defines the contract for a job processor.
 * This will typically be implemented by an Agent.
 *
 * The `process` method should:
 * - Return a value of type `Output` if the job is successfully completed.
 * - Return `void` (or `undefined`/`null`) if the job is not yet complete
 *   but did not encounter an error, indicating it needs to be re-queued or continued.
 * - Throw an error if the job processing fails.
 */
export interface IProcessor<Input = any, Output = any> {
  process(job: Job<Input, Output>): Promise<Output | void>;
}
