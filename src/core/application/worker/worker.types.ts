// src/core/application/worker/worker.types.ts
import { JobEntity } from "@/core/domain/job/job.entity";

/**
 * Defines the signature for a job processing function.
 * It receives a job entity and should return a promise that resolves with the result.
 * If an error is thrown, the job will be marked as failed.
 */
export type ProcessorFunction<
  P extends { userId?: string } = { userId?: string },
  R = unknown,
> = (job: JobEntity<P, R>) => Promise<R>;

/**
 * Options for configuring a WorkerService.
 */
export interface WorkerOptions {
  /**
   * The maximum number of jobs that this worker can process concurrently.
   * @default 1
   */
  concurrency?: number;

  /**
   * Duration (in milliseconds) for which a job is locked when processed by a worker.
   * If the worker does not complete or extend the lock within this time,
   * the job might be considered stalled.
   * @default 30000 (30 seconds)
   */
  lockDuration?: number;

  /**
   * Defines how long before the lock expires that the worker should try to renew it.
   * Expressed as a fraction of lockDuration, e.g., 0.5 for 50%.
   * If not set, a sensible default (e.g., 0.5 * lockDuration or lockDuration - 5s) should be used.
   * A value of 0 would mean renewing just before expiry, a value of 1 would mean renewing immediately after acquiring.
   * @default (lockDuration / 2) or a fixed buffer like 5000ms if lockDuration is very short.
   */
  lockRenewTimeBuffer?: number;

  /**
   * The maximum number of times a job can be marked as stalled before it is failed permanently.
   * @default 1
   */
  maxStalledCount?: number;

  // TODO: Consider adding autorun: boolean (default true) if we want to control when the worker starts processing.
}
