// src_refactored/core/ports/adapters/job-queue.interface.ts
import { Result } from '../../../shared/result';
import { Job } from '../../domain/job/job.entity';
import { JobId } from '../../domain/job/value-objects/job-id.vo';
// Assuming TargetAgentRole is a VO that might be string-based or more complex
import { TargetAgentRole } from '../../domain/job/value-objects/target-agent-role.vo';
import { QueueError } from '../../common/errors';

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
   * @param job The Job entity to add.
   * @returns A Result containing the added Job (possibly updated by the queue, e.g., with a queue-specific ID or status) or a QueueError.
   */
  add(job: Job): Promise<Result<Job, QueueError>>;

  /**
   * Retrieves the next available job from the queue for a worker that supports specific roles.
   * The implementation should handle locking or marking the job as acquired to prevent multiple workers from processing the same job.
   * @param workerId A unique identifier for the worker attempting to get the job.
   * @param supportedRoles An array of TargetAgentRole VOs or their string representations that the worker can process.
   * @returns A Result containing the Job or null if no suitable job is available, or a QueueError.
   */
  getNext(workerId: string, supportedRoles: TargetAgentRole[]): Promise<Result<Job | null, QueueError>>;
  // Alternative for supportedRoles if TargetAgentRole is complex:
  // getNext(workerId: string, supportedRoles: string[]): Promise<Result<Job | null, QueueError>>;


  /**
   * Marks a job as successfully completed.
   * This typically involves updating the job's status and potentially removing it from active processing.
   * @param jobId The JobId of the completed job.
   * @param resultData Optional data representing the outcome or result of the job.
   * @returns A Result indicating success (void) or a QueueError.
   */
  complete(jobId: JobId, resultData?: any): Promise<Result<void, QueueError>>;

  /**
   * Marks a job as failed.
   * This typically involves updating the job's status, logging error details, and potentially scheduling a retry.
   * @param jobId The JobId of the failed job.
   * @param errorDetails An object containing details about the failure.
   * @param attempt The attempt number for this job execution.
   * @returns A Result indicating success (void) or a QueueError.
   */
  fail(jobId: JobId, errorDetails: FailDetails, attempt: number): Promise<Result<void, QueueError>>;

  /**
   * Delays a job's execution until a specified time.
   * The job might be moved to a delayed state or its visibility in the queue adjusted.
   * @param jobId The JobId of the job to delay.
   * @param delayUntil The Date until which the job execution should be postponed.
   * @returns A Result indicating success (void) or a QueueError.
   */
  delay(jobId: JobId, delayUntil: Date): Promise<Result<void, QueueError>>;

  /**
   * Retrieves a specific job by its ID from the queue/storage, regardless of its current status.
   * Useful for monitoring, direct inspection, or manual intervention.
   * @param jobId The JobId of the job to retrieve.
   * @returns A Result containing the Job or null if not found, or a QueueError.
   */
  getJobById(jobId: JobId): Promise<Result<Job | null, QueueError>>;

  // Consider other potential methods:
  // - updateJob(job: Job): Promise<Result<Job, QueueError>>; (For more general updates if needed by application layer)
  // - requeue(jobId: JobId): Promise<Result<void, QueueError>>; (To explicitly put a job back for processing)
  // - countJobs(status?: JobStatus): Promise<Result<number, QueueError>>; (For monitoring)
}

export const IJobQueueToken = Symbol('IJobQueue');
