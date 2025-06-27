// src_refactored/core/domain/job/ports/job-repository.interface.ts
import { Result } from '@/shared/result';

import { JobEntity } from '../job.entity';
import { JobIdVO } from '../value-objects/job-id.vo';
import { JobStatusVO, JobStatusEnum } from '../value-objects/job-status.vo'; // Assuming JobStatusType is JobStatusEnum

import {
  JobSearchFilters,
  PaginationOptions,
  PaginatedJobsResult,
  JobCountsByStatus
} from './job-repository.types';

export const IJobRepository = Symbol('IJobRepository');

export interface IJobRepository {
  /**
   * Saves a job (creates if new, updates if existing based on ID).
   * Implementations must handle upsert logic.
   */
  save(job: JobEntity<any, any>): Promise<Result<void, Error>>;

  /**
   * Finds a job by its ID.
   */
  findById(id: JobIdVO): Promise<Result<JobEntity<any, any> | null, Error>>;

  /**
   * Finds multiple jobs by their IDs.
   * Returns only found jobs. Order may not be guaranteed unless specified.
   */
  findByIds(ids: JobIdVO[]): Promise<Result<JobEntity<any, any>[], Error>>;

  /**
   * Finds processable jobs for a given queue.
   * This is a critical method for workers. Implementations must handle:
   * - Filtering by queueName, status (PENDING), and processAt <= now.
   * - Ordering by priority and then by createdAt (FIFO/LIFO based on job options or queue config).
   * - Atomically locking the fetched jobs (e.g., setting status to ACTIVE, lockedByWorkerId, lockExpiresAt).
   * @param queueName The name of the queue.
   * @param workerId The ID of the worker attempting to fetch jobs (for locking).
   * @param limit Max number of jobs to fetch.
   * @param now Current timestamp for processAt comparison.
   */
  findAndLockProcessableJobs(
    queueName: string,
    workerId: string,
    limit: number,
    nowTimestampMs: number, // Pass as epoch ms for direct DB comparison
    lockDurationMs: number,
  ): Promise<Result<JobEntity<any, any>[], Error>>;

  /**
   * Finds active jobs whose lock has expired (stalled jobs).
   * @param queueName Optional: filter by queue name.
   * @param lockExpiresAtBefore Timestamp to consider locks expired (e.g., Date.now()).
   * @param limit Max number of stalled jobs to fetch.
   */
  findStalledJobs(
    lockExpiresAtBefore: number, // Epoch ms
    limit: number,
    queueName?: string,
  ): Promise<Result<JobEntity<any, any>[], Error>>;

  /**
   * Finds delayed jobs that are ready to be promoted to pending.
   * @param queueName Optional: filter by queue name.
   * @param nowTimestampMs Current timestamp for processAt comparison.
   * @param limit Max number of jobs to promote.
   */
  findDelayedJobsToPromote(
    nowTimestampMs: number, // Epoch ms
    limit: number,
    queueName?: string,
  ): Promise<Result<JobEntity<any, any>[], Error>>;

  /**
   * Finds all jobs associated with a specific repeat key.
   */
  findJobsByRepeatKey(
    queueName: string,
    repeatKey: string
  ): Promise<Result<JobEntity<any, any>[], Error>>;

  /**
   * Finds all jobs that have a specific parent job ID.
   */
  findJobsByParentId(parentId: JobIdVO): Promise<Result<JobEntity<any, any>[], Error>>;

  /**
   * Gets counts of jobs grouped by status for a given queue.
   */
  getJobCountsByStatus(queueName: string): Promise<Result<JobCountsByStatus, Error>>;

  /**
   * Deletes a job by its ID.
   */
  delete(id: JobIdVO): Promise<Result<void, Error>>;

  /**
   * Removes completed jobs older than a certain date or up to a limit for a queue.
   * @returns The number of jobs removed.
   */
  removeCompletedJobs(
    queueName: string,
    olderThanTimestampMs?: number, // Epoch ms
    limit?: number,
  ): Promise<Result<number, Error>>;

  /**
   * Removes failed jobs older than a certain date or up to a limit for a queue.
   * @returns The number of jobs removed.
   */
  removeFailedJobs(
    queueName: string,
    olderThanTimestampMs?: number, // Epoch ms
    limit?: number,
  ): Promise<Result<number, Error>>;

  /**
   * Searches for jobs based on filters and pagination options.
   * Primarily for admin/UI purposes.
   */
  search(
    filters: JobSearchFilters,
    pagination: PaginationOptions,
  ): Promise<Result<PaginatedJobsResult<any, any>, Error>>;

  // Potentially more specific update methods if needed for performance,
  // though `save` should handle general updates.
  // Example:
  // updateJobStatus(jobId: JobIdVO, status: JobStatusVO, previousStatus?: JobStatusVO): Promise<Result<void, Error>>;
  // updateJobProgress(jobId: JobIdVO, progress: JobProgressVO): Promise<Result<void, Error>>;
  // addJobLog(jobId: JobIdVO, logEntry: JobExecutionLogEntryVO): Promise<Result<void, Error>>;
}
