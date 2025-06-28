// src_refactored/core/application/queue/dtos/worker-options.dto.ts

/**
 * Options for configuring a Worker.
 * Based on BullMQ-inspired design document, Section 4.3 WorkerOptions.
 */
export interface WorkerOptions {
  /**
   * Number of jobs to process concurrently.
   * @default 1
   */
  concurrency?: number;

  /**
   * Milliseconds a job can be locked by this worker before being considered stalled.
   * @default 30000 (30 seconds)
   */
  lockDuration?: number;

  /**
   * Milliseconds before lock expiration to attempt renewal.
   * Should be less than lockDuration.
   * @default 15000 (15 seconds)
   */
  lockRenewTime?: number;

  /**
   * Whether the worker should start processing jobs automatically upon instantiation.
   * @default true
   */
  autorun?: boolean;

  // TODO: Consider if a separate DrizzleClient or JobEventEmitter instance
  // should be passable here to override those from the JobQueueService,
  // as hinted in the design doc. For now, assume they come from JobQueueService.
}
