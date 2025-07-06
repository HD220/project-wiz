// src/core/application/ports/job-repository.interface.ts
import { JobEntity, JobStatus } from "@/core/domain/job/job.entity";
import { JobIdVO } from "@/core/domain/job/value-objects/job-id.vo";

export const JOB_REPOSITORY_TOKEN = Symbol("IJobRepository");

export interface IJobRepository<P extends { userId?: string }, R = unknown> {
  /**
   * Saves a new job or updates an existing one.
   * This should handle both creation and full update scenarios.
   * @param job The job entity to save.
   */
  save(job: JobEntity<P, R>): Promise<void>;

  /**
   * Updates specific fields of an existing job.
   * Prefer this for partial updates to avoid overwriting unchanged fields.
   * @param job The job entity with fields to update.
   *            The implementation should be smart enough to update only changed/provided fields.
   *            Alternatively, have more granular methods like updateStatus, updateProgress, etc.
   *            For now, a general update that persists the current state of the entity.
   */
  update(job: JobEntity<P, R>): Promise<void>;

  /**
   * Finds a job by its ID.
   * @param id The ID of the job.
   * @returns The job entity if found, otherwise null.
   */
  findById(id: JobIdVO): Promise<JobEntity<P, R> | null>;

  /**
   * Finds the next batch of jobs that are ready to be processed.
   * This should include jobs in 'waiting' status or 'delayed' jobs whose delayUntil time has passed.
   * Jobs should be ordered by priority and then by creation time.
   * @param queueName The name of the queue.
   * @param limit The maximum number of jobs to return.
   * @returns An array of job entities.
   */
  findNextJobsToProcess(
    queueName: string,
    limit: number
  ): Promise<Array<JobEntity<P, R>>>;

  /**
   * Attempts to acquire an exclusive lock on a job for a specific worker.
   * Sets the job's workerId and lockUntil time if successful.
   * @param jobId The ID of the job to lock.
   * @param workerId The ID of the worker acquiring the lock.
   * @param lockUntil The timestamp until which the lock is valid.
   * @returns True if the lock was acquired, false otherwise (e.g., job not found, already locked).
   */
  acquireLock(
    jobId: JobIdVO,
    workerId: string,
    lockUntil: Date
  ): Promise<boolean>;

  /**
   * Releases an exclusive lock on a job.
   * This might be called if a worker gracefully stops processing a job it locked.
   * Often, locks are just allowed to expire or are cleared when a job is finalized.
   * @param jobId The ID of the job.
   * @param workerId The ID of the worker that held the lock.
   */
  // releaseLock(jobId: JobIdVO, workerId: string): Promise<void>; // Optional, consider if truly needed vs lock expiry

  /**
   * Extends the duration of an existing lock on a job.
   * @param jobId The ID of the job.
   * @param workerId The ID of the worker holding the lock.
   * @param lockUntil The new timestamp until which the lock is valid.
   */
  extendLock(jobId: JobIdVO, workerId: string, lockUntil: Date): Promise<void>;

  /**
   * Finds jobs that are considered stalled (i.e., were active but their lock has expired).
   * @param queueName The name of the queue.
   * @param olderThan The timestamp to identify locks that have expired (lockUntil < olderThan).
   * @param limit The maximum number of stalled jobs to return.
   * @returns An array of stalled job entities.
   */
  findStalledJobs(
    queueName: string,
    olderThan: Date,
    limit: number
  ): Promise<Array<JobEntity<P, R>>>;

  /**
   * Removes a job from the repository.
   * @param jobId The ID of the job to remove.
   */
  remove(jobId: JobIdVO): Promise<void>;

  /**
   * Retrieves jobs by their status.
   * @param queueName The name of the queue.
   * @param statuses An array of job statuses to filter by.
   * @param start Zero-based offset for pagination.
   * @param end Zero-based limit for pagination.
   * @param asc If true, order by creation time ascending, otherwise descending.
   * @returns An array of job entities.
   */
  getJobsByStatus(
    queueName: string,
    statuses: JobStatus[],
    start?: number,
    end?: number,
    asc?: boolean
  ): Promise<Array<JobEntity<P, R>>>;

  /**
   * Counts jobs by their status for a given queue.
   * @param queueName The name of the queue.
   * @param statuses An array of job statuses to count. If undefined, counts all.
   * @returns A record mapping job status to its count.
   */
  countJobsByStatus(
    queueName: string,
    statuses?: JobStatus[]
  ): Promise<Partial<Record<JobStatus, number>>>;

  /**
   * Cleans (removes) old jobs from the queue based on specified criteria.
   * @param queueName The name of the queue.
   * @param gracePeriodMs Time in ms. Jobs older than this period will be considered for cleaning.
   *                      The exact meaning of "older" depends on the status.
   *                      For 'completed' or 'failed', it's based on `finishedOn`.
   *                      For 'delayed' or 'waiting', it's based on `createdAt` (less common to clean these by age).
   * @param limit The maximum number of jobs to clean in one go.
   * @param status Optional. If specified, only clean jobs of this status. Otherwise, might clean completed/failed.
   * @returns The number of jobs cleaned.
   */
  clean(
    queueName: string,
    gracePeriodMs: number,
    limit: number,
    status?: JobStatus
  ): Promise<number>;
}
