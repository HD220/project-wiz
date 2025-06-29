// src_refactored/infrastructure/queue/drizzle/queue.service.ts
import { injectable, inject } from 'inversify';

import { IJobRepository, JOB_REPOSITORY_TOKEN } from '@/core/application/ports/job-repository.interface';
import { AbstractQueue } from '@/core/application/queue/abstract-queue';
import { JobEntity, JobStatus } from '@/core/domain/job/job.entity';
import { calculateBackoff } from '@/core/domain/job/utils/calculate-backoff'; // Assuming this utility exists
import { JobIdVO } from '@/core/domain/job/value-objects/job-id.vo';
import { IJobOptions, JobOptionsVO } from '@/core/domain/job/value-objects/job-options.vo';

const DEFAULT_STALLED_CHECK_INTERVAL_MS = 15 * 1000; // 15 seconds
const DEFAULT_STALLED_JOB_OLDER_THAN_MS = 30 * 1000; // 30 seconds, should be > typical lockDuration
const DEFAULT_LOCK_DURATION_MS = 30 * 1000; // Default lock duration for jobs fetched by this queue service
                                           // This might be overridden by worker options.

export interface QueueServiceOptions {
  defaultJobOptions?: IJobOptions;
  stalledJobs?: {
    checkIntervalMs?: number;
    olderThanMs?: number; // How old a lock must be to be considered stalled
    limitPerCheck?: number; // Max stalled jobs to process per check
  };
}

@injectable()
export class DrizzleQueueService<P = unknown, R = unknown> extends AbstractQueue<P, R> {
  private stalledJobsCheckInterval: ReturnType<typeof setTimeout> | null = null;
  private readonly stalledCheckIntervalMs: number;
  private readonly stalledOlderThanMs: number;
  private readonly stalledLimitPerCheck: number;
  private isPaused: boolean = false;

  constructor(
    queueName: string,
    @inject(JOB_REPOSITORY_TOKEN) jobRepository: IJobRepository,
    options?: QueueServiceOptions,
  ) {
    super(queueName, jobRepository, options?.defaultJobOptions);
    this.stalledCheckIntervalMs = options?.stalledJobs?.checkIntervalMs ?? DEFAULT_STALLED_CHECK_INTERVAL_MS;
    this.stalledOlderThanMs = options?.stalledJobs?.olderThanMs ?? DEFAULT_STALLED_JOB_OLDER_THAN_MS;
    this.stalledLimitPerCheck = options?.stalledJobs?.limitPerCheck ?? 10;
  }

  async add(jobName: string, data: P, opts?: IJobOptions): Promise<JobEntity<P, R>> {
    const mergedOptions = this.defaultJobOptions.merge(JobOptionsVO.create(opts));
    const job = JobEntity.create<P, R>(
      this.queueName,
      jobName,
      data,
      mergedOptions,
    );
    await this.jobRepository.save(job as JobEntity<unknown, unknown>);
    this.emit('job.added', { jobId: job.id.value, name: job.name, queueName: this.queueName });
    return job;
  }

  async addBulk(jobs: Array<{ name: string; data: P; opts?: IJobOptions }>): Promise<Array<JobEntity<P, R>>> {
    const jobEntities: Array<JobEntity<P, R>> = [];
    for (const jobDef of jobs) {
      const mergedOptions = this.defaultJobOptions.merge(JobOptionsVO.create(jobDef.opts));
      const job = JobEntity.create<P, R>(
        this.queueName,
        jobDef.name,
        jobDef.data,
        mergedOptions,
      );
      jobEntities.push(job);
      // Not saving one by one here to potentially optimize for bulk insert if repo supports it.
      // Current DrizzleJobRepository.save uses onConflictDoUpdate which is one by one effectively.
      // A true bulk insert would need a different method in IJobRepository.
    }

    // For now, save one by one as the repository's `save` is designed for single entities.
    // A future optimization could be a `saveBulk` method in the repository.
    for (const job of jobEntities) {
      await this.jobRepository.save(job as JobEntity<unknown, unknown>);
      this.emit('job.added', { jobId: job.id.value, name: job.name, queueName: this.queueName });
    }
    return jobEntities;
  }

  async getJob(jobId: string | JobIdVO): Promise<JobEntity<P, R> | null> {
    const id = typeof jobId === 'string' ? JobIdVO.create(jobId) : jobId;
    const job = await this.jobRepository.findById(id);
    return job ? job as JobEntity<P, R> : null;
  }

  async getJobsByStatus(
    statuses: JobStatus[],
    start?: number,
    end?: number,
    asc?: boolean,
  ): Promise<Array<JobEntity<P, R>>> {
    const jobs = await this.jobRepository.getJobsByStatus(this.queueName, statuses, start, end, asc);
    return jobs as Array<JobEntity<P, R>>;
  }

  async countJobsByStatus(statuses?: JobStatus[]): Promise<Partial<Record<JobStatus, number>>> {
    return this.jobRepository.countJobsByStatus(this.queueName, statuses);
  }

  async pause(): Promise<void> {
    this.isPaused = true;
    this.emit('queue.paused', { queueName: this.queueName });
    // console.log(`Queue ${this.queueName} paused.`);
  }

  async resume(): Promise<void> {
    this.isPaused = false;
    this.emit('queue.resumed', { queueName: this.queueName });
    // console.log(`Queue ${this.queueName} resumed.`);
  }

  async clean(gracePeriodMs: number, limit: number, status?: JobStatus): Promise<number> {
    const count = await this.jobRepository.clean(this.queueName, gracePeriodMs, limit, status);
    this.emit('queue.cleaned', { queueName: this.queueName, count });
    return count;
  }

  async close(): Promise<void> {
    if (this.stalledJobsCheckInterval) {
      clearInterval(this.stalledJobsCheckInterval);
      this.stalledJobsCheckInterval = null;
    }
    this.emit('queue.closed', { queueName: this.queueName });
    // console.log(`Queue ${this.queueName} closed.`);
  }

  async fetchNextJobAndLock(workerId: string, lockDurationMs: number = DEFAULT_LOCK_DURATION_MS): Promise<JobEntity<P, R> | null> {
    if (this.isPaused) {
      return null;
    }

    // This is a simplified fetch. A real implementation might involve multiple attempts or more complex queries.
    const potentialJobs = await this.jobRepository.findNextJobsToProcess(this.queueName, 10); // Fetch a small batch
    if (potentialJobs.length === 0) {
      return null;
    }

    for (const job of potentialJobs) {
      const lockAcquired = await this.jobRepository.acquireLock(job.id, workerId, new Date(Date.now() + lockDurationMs));
      if (lockAcquired) {
        const lockedJob = await this.jobRepository.findById(job.id); // Re-fetch to get updated state (status, lockUntil, startedAt)
        if (lockedJob) {
             this.emit('job.locked', { jobId: lockedJob.id.value, workerId, queueName: this.queueName });
             return lockedJob as JobEntity<P,R>;
        }
      }
    }
    return null;
  }

  async extendJobLock(jobId: string | JobIdVO, workerId: string, lockDurationMs: number): Promise<void> {
    const id = typeof jobId === 'string' ? JobIdVO.create(jobId) : jobId;
    const job = await this.getJob(id);
    if (!job || job.workerId !== workerId || job.status !== JobStatus.ACTIVE) {
      throw new Error(`Cannot extend lock for job ${id.value}: not active or not locked by worker ${workerId}`);
    }
    const newLockUntil = new Date(Date.now() + lockDurationMs);
    await this.jobRepository.extendLock(id, workerId, newLockUntil);
    this.emit('job.lock_extended', { jobId: id.value, workerId, newLockUntil, queueName: this.queueName });
  }

  async markJobAsCompleted(
    jobId: string | JobIdVO,
    workerId: string,
    result: R,
    jobInstanceWithChanges: JobEntity<P,R>
  ): Promise<void> {
    const id = typeof jobId === 'string' ? JobIdVO.create(jobId) : jobId;
    const job = jobInstanceWithChanges ?? await this.getJob(id); // Prefer instance with in-memory changes

    if (!job) {
      this.emit('job.error', {jobId: id.value, error: `Job ${id.value} not found to mark as completed.`, queueName: this.queueName });
      // console.error(`Job ${id.value} not found to mark as completed.`);
      return;
    }
    if (job.workerId !== workerId && job.status === JobStatus.ACTIVE) {
        this.emit('job.error', {jobId: id.value, error: `Job ${id.value} is locked by another worker ${job.workerId}, cannot be completed by ${workerId}.`, queueName: this.queueName });
        // console.warn(`Job ${id.value} is locked by another worker ${job.workerId}, cannot be completed by ${workerId}.`);
        // Potentially allow completion if job is not ACTIVE (e.g. if it was stalled and recovered by a different logic)
        // For now, strict check.
        return;
    }

    job.markAsCompleted(result); // This updates logs, progress from jobInstanceWithChanges if provided
    await this.jobRepository.update(job as JobEntity<unknown, unknown>);
    this.emit('job.completed', { jobId: id.value, result, queueName: this.queueName });
  }

  async markJobAsFailed(
    jobId: string | JobIdVO,
    workerId: string,
    error: Error,
    jobInstanceWithChanges: JobEntity<P,R>
  ): Promise<void> {
    const id = typeof jobId === 'string' ? JobIdVO.create(jobId) : jobId;
    const job = jobInstanceWithChanges ?? await this.getJob(id);

    if (!job) {
      this.emit('job.error', {jobId: id.value, error: `Job ${id.value} not found to mark as failed.`, queueName: this.queueName });
      // console.error(`Job ${id.value} not found to mark as failed.`);
      return;
    }
     if (job.workerId !== workerId && job.status === JobStatus.ACTIVE) {
        this.emit('job.error', {jobId: id.value, error: `Job ${id.value} is locked by another worker ${job.workerId}, cannot be failed by ${workerId}.`, queueName: this.queueName });
        // console.warn(`Job ${id.value} is locked by another worker ${job.workerId}, cannot be failed by ${workerId}.`);
        return;
    }

    job.addLog(`Attempt ${job.attempts + 1} failed. Error: ${error.message}`, 'ERROR', new Date());
    if (job.options.stackTraceLimit && error.stack) {
        job.addLog(`Stack trace: ${error.stack.substring(0, job.options.stackTraceLimit)}`, 'DEBUG', new Date());
    }

    const shouldRetry = job.attempts < (job.options.attempts ?? 0);
    if (shouldRetry) {
      const backoffStrategy = job.options.backoff;
      const delay = calculateBackoff(job.attempts + 1, backoffStrategy);
      job.markAsDelayed(new Date(Date.now() + delay), error);
      this.emit('job.retrying', { jobId: id.value, delay, attempt: job.attempts, queueName: this.queueName });
    } else {
      job.markAsFailed(error);
      this.emit('job.failed', { jobId: id.value, error: error.message, queueName: this.queueName });
    }
    await this.jobRepository.update(job as JobEntity<unknown, unknown>);
  }

  async updateJobProgress(jobId: string | JobIdVO, workerId: string, progress: number | object): Promise<void> {
    const id = typeof jobId === 'string' ? JobIdVO.create(jobId) : jobId;
    const job = await this.getJob(id);
    if (!job) {
      // console.warn(`Job ${id.value} not found to update progress.`);
      return;
    }
    if (job.workerId !== workerId || job.status !== JobStatus.ACTIVE) {
      // console.warn(`Cannot update progress for job ${id.value}: not active or not locked by worker ${workerId}`);
      return;
    }
    job.updateProgress(progress);
    await this.jobRepository.update(job as JobEntity<unknown, unknown>); // Could optimize to only update progress field
    this.emit('job.progress', { jobId: id.value, progress, queueName: this.queueName });
  }

  async addJobLog(jobId: string | JobIdVO, workerId: string, message: string, level: string = 'INFO'): Promise<void> {
    const id = typeof jobId === 'string' ? JobIdVO.create(jobId) : jobId;
    const job = await this.getJob(id);
    if (!job) {
      // console.warn(`Job ${id.value} not found to add log.`);
      return;
    }
     // Allow logs even if not locked by this worker, e.g. system logs about the job.
     // However, typically logs come from the active worker.
    // if (job.workerId !== workerId || job.status !== JobStatus.ACTIVE) {
    //   // console.warn(`Cannot add log for job ${id.value}: not active or not locked by worker ${workerId}`);
    //   return;
    // }
    job.addLog(message, level, new Date());
    await this.jobRepository.update(job as JobEntity<unknown, unknown>); // Could optimize to only update logs field
    this.emit('job.log_added', { jobId: id.value, message, level, queueName: this.queueName });
  }

  public startMaintenance(): void {
    if (this.stalledJobsCheckInterval) {
      // console.log(`Stalled jobs manager for queue ${this.queueName} already running.`);
      return;
    }
    this.stalledJobsCheckInterval = setInterval(
      () => this.checkForStalledJobs().catch(err => {
        this.emit('queue.error', { queueName: this.queueName, error: `Error in stalled job check: ${err.message}` });
        // console.error(`Error in stalled job check for queue ${this.queueName}:`, err)
      }),
      this.stalledCheckIntervalMs,
    );
    // console.log(`Stalled jobs manager started for queue ${this.queueName}. Interval: ${this.stalledCheckIntervalMs}ms`);
  }

  private async checkForStalledJobs(): Promise<void> {
    if (this.isPaused) return;

    const olderThan = new Date(Date.now() - this.stalledOlderThanMs);
    const stalledJobs = await this.jobRepository.findStalledJobs(
      this.queueName,
      olderThan,
      this.stalledLimitPerCheck,
    );

    if (stalledJobs.length > 0) {
        this.emit('queue.stalled_check', { queueName: this.queueName, count: stalledJobs.length });
        // console.log(`Found ${stalledJobs.length} stalled jobs in queue ${this.queueName}.`);
    }

    for (const job of stalledJobs) {
      const originalJob = job as JobEntity<P, R>; // Cast for type safety with P,R
      this.emit('job.stalled', { jobId: originalJob.id.value, workerId: originalJob.workerId, queueName: this.queueName });

      const shouldFailPermanently = originalJob.markAsStalled(); // Increments stalled count, checks against maxStalledCount from options

      if (shouldFailPermanently) {
        originalJob.markAsFailed(new Error(`Job stalled too many times (max ${originalJob.options.maxStalledCount})`));
        this.emit('job.failed', { jobId: originalJob.id.value, error: 'Job stalled too many times', queueName: this.queueName });
      } else {
        // Try to re-queue or mark as delayed with backoff
        const backoffStrategy = originalJob.options.backoff; // Use job's specific backoff
        const delay = calculateBackoff(originalJob.attempts +1, backoffStrategy, true); // true for stalled related backoff

        if (delay > 0 && originalJob.options.attempts > originalJob.attempts) { // Ensure it can be retried
            originalJob.markAsDelayed(new Date(Date.now() + delay), new Error('Job stalled and will be retried after delay'));
            this.emit('job.retrying', { jobId: originalJob.id.value, delay, attempt: originalJob.attempts, reason: 'stalled', queueName: this.queueName });
        } else {
            // If no more attempts or no backoff, put back to WAITING to be picked up immediately
            // Or, if no attempts left, it should have been failed by markAsStalled logic.
            // This path means it can be retried but no specific delay from backoff (e.g. backoff type 'fixed' with 0 delay)
            originalJob.status = JobStatus.WAITING;
            originalJob.workerId = undefined;
            originalJob.lockUntil = undefined;
            // Do not increment attempts here, as it wasn't a processing failure.
            // Or, consider if a stall should count as an attempt. Current JobEntity.markAsStalled does not increment attempts.
            this.emit('job.requeued_after_stall', { jobId: originalJob.id.value, queueName: this.queueName });
        }
      }
      await this.jobRepository.update(originalJob as JobEntity<unknown, unknown>);
    }
  }
}

// Helper function placeholder - ensure this is implemented correctly, possibly within JobEntity or as a standalone utility.
// import { BackoffOptions, BackoffType } from '@/core/domain/job/value-objects/job-options.vo';
// function calculateBackoff(attempt: number, strategy?: BackoffOptions | BackoffType, isStalled: boolean = false): number {
//   if (!strategy) return 0;

//   const options = typeof strategy === 'string' ? { type: strategy } : strategy;
//   const baseDelay = options.delay || 1000; // Default 1s for exponential/fixed if not provided

//   switch (options.type) {
//     case 'exponential':
//       return Math.min(options.maxDelay || 60000, baseDelay * Math.pow(2, attempt -1));
//     case 'fixed':
//       return baseDelay;
//     // Add other strategies like 'linear' if needed
//     default:
//       return 0;
//   }
// }
