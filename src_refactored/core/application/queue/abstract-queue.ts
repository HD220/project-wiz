// src_refactored/core/application/queue/abstract-queue.ts
import EventEmitter from 'node:events';

import { JobEntity, JobStatus } from '@/core/domain/job/job.entity';
import { JobIdVO } from '@/core/domain/job/value-objects/job-id.vo';
import { IJobOptions, JobOptionsVO } from '@/core/domain/job/value-objects/job-options.vo';

import { IJobRepository } from '../ports/job-repository.interface';

export const QUEUE_SERVICE_TOKEN_PREFIX = 'QueueService:';
export const getQueueServiceToken = (queueName: string) => `${QUEUE_SERVICE_TOKEN_PREFIX}${queueName}`;


export abstract class AbstractQueue<P = unknown, R = unknown> extends EventEmitter {
  public readonly queueName: string;
  protected readonly jobRepository: IJobRepository;
  protected readonly defaultJobOptions: JobOptionsVO;

  constructor(
    queueName: string,
    jobRepository: IJobRepository,
    defaultJobOptions?: IJobOptions,
  ) {
    super();
    this.queueName = queueName;
    this.jobRepository = jobRepository;
    this.defaultJobOptions = JobOptionsVO.create(defaultJobOptions);

    if (new.target === AbstractQueue) {
      throw new TypeError("Cannot construct AbstractQueue instances directly");
    }
  }

  /**
   * Adds a new job to the queue.
   * @param jobName The name of the job.
   * @param data The payload for the job.
   * @param opts Optional job-specific options.
   * @returns The created job entity.
   */
  abstract add(jobName: string, data: P, opts?: IJobOptions): Promise<JobEntity<P, R>>;

  /**
   * Adds multiple jobs to the queue.
   * @param jobs An array of job definitions.
   * @returns An array of created job entities.
   */
  abstract addBulk(jobs: Array<{ name: string; data: P; opts?: IJobOptions }>): Promise<Array<JobEntity<P, R>>>;

  /**
   * Retrieves a job by its ID.
   * @param jobId The ID of the job.
   * @returns The job entity if found, otherwise null.
   */
  abstract getJob(jobId: string | JobIdVO): Promise<JobEntity<P, R> | null>;

  /**
   * Retrieves jobs by their status.
   * @param statuses An array of job statuses.
   * @param start Zero-based offset for pagination.
   * @param end Zero-based limit for pagination.
   * @param asc If true, order by creation time ascending, otherwise descending.
   */
  abstract getJobsByStatus(
    statuses: JobStatus[],
    start?: number,
    end?: number,
    asc?: boolean,
  ): Promise<Array<JobEntity<P, R>>>;

  /**
   * Counts jobs by their status for this queue.
   * @param statuses An array of job statuses to count. If undefined, counts all.
   * @returns A record mapping job status to its count.
   */
  abstract countJobsByStatus(statuses?: JobStatus[]): Promise<Partial<Record<JobStatus, number>>>;

  /**
   * Pauses the queue. No new jobs will be processed until resumed.
   */
  abstract pause(): Promise<void>;

  /**
   * Resumes a paused queue.
   */
  abstract resume(): Promise<void>;

  /**
   * Cleans old jobs from the queue based on specified criteria.
   * @param gracePeriodMs Time in ms. Jobs older than this period will be considered.
   * @param limit Max number of jobs to clean.
   * @param status Optional. If specified, only clean jobs of this status.
   * @returns Number of jobs cleaned.
   */
  abstract clean(gracePeriodMs: number, limit: number, status?: JobStatus): Promise<number>;

  /**
   * Closes the queue and its underlying connections. Stops any internal timers.
   */
  abstract close(): Promise<void>;

  // --- Methods primarily for Worker interaction ---

  /**
   * Fetches the next available job from the queue and locks it for the worker.
   * @param workerId The ID of the worker requesting the job.
   * @param lockDurationMs The duration (in ms) for which the job should be locked.
   * @returns The job entity if one is available and locked, otherwise null.
   */
  abstract fetchNextJobAndLock(workerId: string, lockDurationMs: number): Promise<JobEntity<P, R> | null>;

  /**
   * Extends the lock on an active job.
   * @param jobId The ID of the job.
   * @param workerId The ID of the worker holding the lock.
   * @param lockDurationMs The additional duration (in ms) to extend the lock by, or the new lockUntil timestamp.
   */
  abstract extendJobLock(jobId: string | JobIdVO, workerId: string, lockDurationMs: number): Promise<void>;

  /**
   * Marks a job as completed.
   * @param jobId The ID of the job.
   * @param workerId The ID of the worker that completed the job.
   * @param result The return value of the job's processing function.
   * @param jobInstanceWithChanges The job entity instance, potentially with updated progress/logs in memory.
   */
  abstract markJobAsCompleted(
    jobId: string | JobIdVO,
    workerId: string,
    result: R,
    jobInstanceWithChanges: JobEntity<P,R>
  ): Promise<void>;

  /**
   * Marks a job as failed. Handles retry logic (backoff, attempts).
   * @param jobId The ID of the job.
   * @param workerId The ID of the worker that processed the job.
   * @param error The error that caused the job to fail.
   * @param jobInstanceWithChanges The job entity instance, potentially with updated progress/logs in memory.
   */
  abstract markJobAsFailed(
    jobId: string | JobIdVO,
    workerId: string,
    error: Error,
    jobInstanceWithChanges: JobEntity<P,R>
  ): Promise<void>;

  /**
   * Updates the progress of a job.
   * @param jobId The ID of the job.
   * @param workerId The ID of the worker updating the progress.
   * @param progress The progress value (number or object).
   */
  abstract updateJobProgress(jobId: string | JobIdVO, workerId: string, progress: number | object): Promise<void>;

  /**
   * Adds a log entry to a job.
   * @param jobId The ID of the job.
   * @param workerId The ID of the worker adding the log.
   * @param message The log message.
   * @param level Optional log level (e.g., 'INFO', 'DEBUG').
   */
  abstract addJobLog(jobId: string | JobIdVO, workerId: string, message: string, level?: string): Promise<void>;

  /**
   * Starts any internal maintenance tasks, like checking for stalled jobs.
   * Should be idempotent.
   */
  abstract startMaintenance(): void;
}
