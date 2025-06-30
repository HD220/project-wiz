// src_refactored/core/ports/adapters/job-queue.interface.ts
import { QueueError } from '@/core/domain/common/errors'; // Corrected alias path

import { Result } from '@/shared/result'; // Aliased
import { JobEntity } from '@/core/domain/job/job.entity'; // Aliased and Renamed
import { JobIdVO } from '@/core/domain/job/value-objects/job-id.vo'; // Aliased and Renamed
// Assuming TargetAgentRole is a VO that might be string-based or more complex
import { TargetAgentRoleVO } from '@/core/domain/agent/value-objects/target-agent-role.vo'; // Corrected path and Renamed

export interface FailDetails {
  message: string;
  stack?: string;
  retryable?: boolean;
  // Additional structured error data can be added here
}

export interface IJobQueue {
  /**
   * Adds a job to the queue.
   * The implementation will determine how the job is stored and prioritized.
   * @param job The JobEntity entity to add.
   * @returns A Result containing the added JobEntity (possibly updated by the queue, e.g., with a queue-specific ID or status) or a QueueError.
   */
  add(job: JobEntity): Promise<Result<JobEntity, QueueError>>;

  /**
   * Retrieves the next available job from the queue for a worker that supports specific roles.
   * The implementation should handle locking or marking the job as acquired to prevent multiple workers from processing the same job.
   * @param workerId A unique identifier for the worker attempting to get the job.
   * @param supportedRoles An array of TargetAgentRoleVO VOs or their string representations that the worker can process.
   * @returns A Result containing the JobEntity or null if no suitable job is available, or a QueueError.
   */
  getNext(workerId: string, supportedRoles: TargetAgentRoleVO[]): Promise<Result<JobEntity | null, QueueError>>;
  // Alternative for supportedRoles if TargetAgentRoleVO is complex:
  // getNext(workerId: string, supportedRoles: string[]): Promise<Result<JobEntity | null, QueueError>>;


  /**
   * Marks a job as successfully completed.
   * This typically involves updating the job's status and potentially removing it from active processing.
   * @param jobId The JobIdVO of the completed job.
   * @param resultData Optional data representing the outcome or result of the job.
   * @returns A Result indicating success (void) or a QueueError.
   */
  complete(jobId: JobIdVO, resultData?: unknown): Promise<Result<void, QueueError>>; // Changed any to unknown

  /**
   * Marks a job as failed.
   * This typically involves updating the job's status, logging error details, and potentially scheduling a retry.
   * @param jobId The JobIdVO of the failed job.
   * @param errorDetails An object containing details about the failure.
   * @param attempt The attempt number for this job execution.
   * @returns A Result indicating success (void) or a QueueError.
   */
  fail(jobId: JobIdVO, errorDetails: FailDetails, attempt: number): Promise<Result<void, QueueError>>;

  /**
   * Delays a job's execution until a specified time.
   * The job might be moved to a delayed state or its visibility in the queue adjusted.
   * @param jobId The JobIdVO of the job to delay.
   * @param delayUntil The Date until which the job execution should be postponed.
   * @returns A Result indicating success (void) or a QueueError.
   */
  delay(jobId: JobIdVO, delayUntil: Date): Promise<Result<void, QueueError>>;

  /**
   * Retrieves a specific job by its ID from the queue/storage, regardless of its current status.
   * Useful for monitoring, direct inspection, or manual intervention.
   * @param jobId The JobIdVO of the job to retrieve.
   * @returns A Result containing the JobEntity or null if not found, or a QueueError.
   */
  getJobById(jobId: JobIdVO): Promise<Result<JobEntity | null, QueueError>>;

  // Consider other potential methods:
  // - updateJob(job: JobEntity): Promise<Result<JobEntity, QueueError>>; (For more general updates if needed by application layer)
  // - requeue(jobId: JobIdVO): Promise<Result<void, QueueError>>; (To explicitly put a job back for processing)
  // - countJobs(status?: JobStatus): Promise<Result<number, QueueError>>; (For monitoring)
}

export const IJobQueueToken = Symbol('IJobQueue');
