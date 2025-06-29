// src_refactored/infrastructure/queue/drizzle/queue.service.ts
// src_refactored/infrastructure/queue/drizzle/queue.service.ts
import { injectable, inject } from 'inversify';

import { IJobRepository, JOB_REPOSITORY_TOKEN } from '@/core/application/ports/job-repository.interface';
import { AbstractQueue, QueueEvents } from '@/core/application/queue/abstract-queue';
import { JobEntity, JobStatus, JobLogEntry } from '@/core/domain/job/job.entity';
import { calculateBackoff } from '@/core/domain/job/utils/calculate-backoff';
import { JobIdVO } from '@/core/domain/job/value-objects/job-id.vo';
import { IJobOptions, JobOptionsVO } from '@/core/domain/job/value-objects/job-options.vo';
import { DomainError } from '@/core/domain/common/errors';

const DEFAULT_STALLED_CHECK_INTERVAL_MS = 15 * 1000; // 15 seconds
const DEFAULT_STALLED_JOB_OLDER_THAN_MS = 30 * 1000; // 30 seconds, should be > typical lockDuration
const DEFAULT_LOCK_DURATION_MS = 30 * 1000;

export interface DrizzleQueueServiceOptions {
  defaultJobOptions?: IJobOptions;
  stalledJobs?: {
    checkIntervalMs?: number;
    olderThanMs?: number;
    limitPerCheck?: number;
  };
}

@injectable()
export class DrizzleQueueService<P = unknown, R = unknown> extends AbstractQueue<P, R> {
  private stalledJobsCheckIntervalId: ReturnType<typeof setInterval> | null = null;
  private readonly _stalledCheckIntervalMs: number;
  private readonly _stalledOlderThanMs: number;
  private readonly _stalledLimitPerCheck: number;
  private _isPaused: boolean = false;
  private _isClosed: boolean = false;

  constructor(
    queueName: string,
    @inject(JOB_REPOSITORY_TOKEN) jobRepository: IJobRepository,
    options?: DrizzleQueueServiceOptions,
  ) {
    super(queueName, jobRepository, options?.defaultJobOptions);
    this._stalledCheckIntervalMs = options?.stalledJobs?.checkIntervalMs ?? DEFAULT_STALLED_CHECK_INTERVAL_MS;
    this._stalledOlderThanMs = options?.stalledJobs?.olderThanMs ?? DEFAULT_STALLED_JOB_OLDER_THAN_MS;
    this._stalledLimitPerCheck = options?.stalledJobs?.limitPerCheck ?? 10;
  }

  // Type-safe emit
  protected emit<K extends keyof QueueEvents<P, R>>(event: K, data: QueueEvents<P, R>[K]): boolean {
    return super.emit(event, data);
  }


  async add(jobName: string, payload: P, opts?: IJobOptions): Promise<JobEntity<P, R>> {
    if (this._isClosed) throw new DomainError('Queue is closed. Cannot add new jobs.');
    const mergedOptions = this.defaultJobOptions.merge(JobOptionsVO.create(opts));
    const job = JobEntity.create<P, R>({
      queueName: this.queueName,
      name: jobName,
      payload: payload,
      options: mergedOptions.toPersistence(), // Pass raw options for JobEntity creation
    });
    await this.jobRepository.save(job as JobEntity<unknown, unknown>);
    this.emit('job.added', { jobId: job.id.value, name: job.name, queueName: this.queueName, job });
    return job;
  }

  async addBulk(jobs: Array<{ name: string; payload: P; opts?: IJobOptions }>): Promise<Array<JobEntity<P, R>>> {
    if (this._isClosed) throw new DomainError('Queue is closed. Cannot add new jobs.');
    const jobEntities: Array<JobEntity<P, R>> = [];
    for (const jobDef of jobs) {
      const mergedOptions = this.defaultJobOptions.merge(JobOptionsVO.create(jobDef.opts));
      const job = JobEntity.create<P, R>({
        queueName: this.queueName,
        name: jobDef.name,
        payload: jobDef.payload,
        options: mergedOptions.toPersistence(),
      });
      jobEntities.push(job);
    }

    // Assuming jobRepository.save can handle single or multiple if optimized later.
    // For now, loop and save individually.
    for (const job of jobEntities) {
      await this.jobRepository.save(job as JobEntity<unknown, unknown>);
      this.emit('job.added', { jobId: job.id.value, name: job.name, queueName: this.queueName, job });
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
    if (this._isClosed) return;
    this._isPaused = true;
    this.emit('queue.paused', { queueName: this.queueName });
  }

  async resume(): Promise<void> {
    if (this._isClosed) return;
    this._isPaused = false;
    this.emit('queue.resumed', { queueName: this.queueName });
  }

  async clean(gracePeriodMs: number, limit: number, status?: JobStatus): Promise<number> {
    const count = await this.jobRepository.clean(this.queueName, gracePeriodMs, limit, status);
    this.emit('queue.cleaned', { queueName: this.queueName, count, status });
    return count;
  }

  async close(): Promise<void> {
    if (this._isClosed) return;
    this._isClosed = true;
    if (this.stalledJobsCheckIntervalId) {
      clearInterval(this.stalledJobsCheckIntervalId);
      this.stalledJobsCheckIntervalId = null;
    }
    this.emit('queue.closed', { queueName: this.queueName });
    super.removeAllListeners(); // Clean up listeners
  }

  async fetchNextJobAndLock(workerId: string, lockDurationMs: number = DEFAULT_LOCK_DURATION_MS): Promise<JobEntity<P, R> | null> {
    if (this._isPaused || this._isClosed) {
      return null;
    }

    const potentialJobs = await this.jobRepository.findNextJobsToProcess(this.queueName, 10);
    if (potentialJobs.length === 0) {
      return null;
    }

    for (const job of potentialJobs) {
      const typedJob = job as JobEntity<P, R>; // Cast early
      const newLockUntil = new Date(Date.now() + lockDurationMs);
      const lockAcquired = await this.jobRepository.acquireLock(typedJob.id, workerId, newLockUntil);
      if (lockAcquired) {
        // Instead of re-fetching, update the instance in memory and assume DB is consistent
        // The repository's acquireLock should have updated the job's status, workerId, lockUntil, attemptsMade, processedOn
        // We need to ensure the DrizzleJobRepository.acquireLock correctly updates these and returns the *updated* entity or enough info.
        // For simplicity, let's assume acquireLock in repo updates the job and returns the *updated* entity or true/false.
        // If it returns true, we re-fetch to ensure we have the latest state.
        const lockedJob = await this.jobRepository.findById(typedJob.id);
        if (lockedJob) {
          this.emit('job.locked', { jobId: lockedJob.id.value, workerId, queueName: this.queueName, job: lockedJob as JobEntity<P,R> });
          return lockedJob as JobEntity<P, R>;
        }
      }
    }
    return null;
  }

  async extendJobLock(jobId: string | JobIdVO, workerId: string, lockDurationMs: number): Promise<void> {
    if (this._isClosed) throw new DomainError('Queue is closed.');
    const id = typeof jobId === 'string' ? JobIdVO.create(jobId) : jobId;
    const job = await this.getJob(id);
    if (!job) throw new DomainError(`Job ${id.value} not found.`);
    if (job.workerId !== workerId || job.status !== JobStatus.ACTIVE) {
      throw new DomainError(`Cannot extend lock for job ${id.value}: not active or not locked by worker ${workerId}`);
    }
    const newLockUntil = new Date(Date.now() + lockDurationMs);
    // Passar workerId para o repositório para que ele possa verificar se o worker que está tentando estender é o mesmo que detém o lock.
    await this.jobRepository.extendLock(id, workerId, newLockUntil);
    job.extendLock(newLockUntil, workerId); // Update entity state
    this.emit('job.lock_extended', { jobId: id.value, workerId, newLockUntil, queueName: this.queueName, job });
  }

  async markJobAsCompleted(
    jobId: string | JobIdVO,
    workerId: string,
    returnValue: R,
    jobInstanceWithChanges: JobEntity<P,R> // This instance has progress/logs from worker
  ): Promise<void> {
    if (this._isClosed) return; // Or throw?
    const id = typeof jobId === 'string' ? JobIdVO.create(jobId) : jobId;
    const job = jobInstanceWithChanges; // Trust the instance passed by the worker

    if (job.id.value !== id.value) {
         this.emit('queue.error', { queueName: this.queueName, error: `Job ID mismatch: ${id.value} vs ${job.id.value}` });
         return;
    }

    if (job.workerId !== workerId && job.status === JobStatus.ACTIVE) {
        this.emit('job.error', { jobId: id.value, error: `Job ${id.value} is locked by another worker ${job.workerId}, cannot be completed by ${workerId}.`, queueName: this.queueName, job });
        return;
    }

    job.markAsCompleted(returnValue);
    await this.jobRepository.update(job as JobEntity<unknown, unknown>);
    this.emit('job.completed', { jobId: id.value, returnValue, queueName: this.queueName, job });
  }

  async markJobAsFailed(
    jobId: string | JobIdVO,
    workerId: string,
    error: Error,
    jobInstanceWithChanges: JobEntity<P,R> // This instance has progress/logs from worker
  ): Promise<void> {
    if (this._isClosed) return;
    const id = typeof jobId === 'string' ? JobIdVO.create(jobId) : jobId;
    const job = jobInstanceWithChanges;

    if (job.id.value !== id.value) {
         this.emit('queue.error', { queueName: this.queueName, error: `Job ID mismatch: ${id.value} vs ${job.id.value}` });
         return;
    }

    if (job.workerId !== workerId && job.status === JobStatus.ACTIVE) {
        this.emit('job.error', { jobId: id.value, error: `Job ${id.value} is locked by another worker ${job.workerId}, cannot be failed by ${workerId}.`, queueName: this.queueName, job });
        return;
    }

    // Logs for this attempt are already in jobInstanceWithChanges from worker
    // job.addLog(`Attempt ${job.attemptsMade} failed. Error: ${error.message}`, 'ERROR'); // attemptsMade is already incremented by moveToActive

    const maxAttempts = job.options.attempts;
    if (job.attemptsMade >= maxAttempts) {
      job.markAsFailed(error.message, error.stack?.split('\n'));
      await this.jobRepository.update(job as JobEntity<unknown, unknown>);
      this.emit('job.failed', { jobId: id.value, error: error.message, queueName: this.queueName, job });
    } else {
      const delay = calculateBackoff(job.attemptsMade, job.options.backoff);
      job.moveToDelayed(new Date(Date.now() + delay), error.message);
      await this.jobRepository.update(job as JobEntity<unknown, unknown>);
      this.emit('job.retrying', { jobId: id.value, delay, attempt: job.attemptsMade, error: error.message, queueName: this.queueName, job });
    }
  }

  async updateJobProgress(jobId: string | JobIdVO, workerId: string, progress: number | object): Promise<void> {
    if (this._isClosed) return;
    const id = typeof jobId === 'string' ? JobIdVO.create(jobId) : jobId;
    const job = await this.getJob(id); // Fetch fresh to avoid race conditions on progress if not sent via jobInstance
    if (!job) {
      this.emit('queue.error', { queueName: this.queueName, error: `Job ${id.value} not found to update progress.` });
      return;
    }
    if (job.workerId !== workerId || job.status !== JobStatus.ACTIVE) {
      this.emit('queue.error', { queueName: this.queueName, error: `Cannot update progress for job ${id.value}: not active or not locked by worker ${workerId}.`, job });
      return;
    }
    job.updateProgress(progress);
    // TODO: Implement IJobRepository.updateProgress for efficiency. Using full update for now.
    await this.jobRepository.update(job as JobEntity<unknown, unknown>);
    this.emit('job.progress', { jobId: id.value, progress, queueName: this.queueName, job });
  }

  async addJobLog(jobId: string | JobIdVO, workerId: string, logEntry: JobLogEntry): Promise<void> {
    if (this._isClosed) return;
    const id = typeof jobId === 'string' ? JobIdVO.create(jobId) : jobId;
    const job = await this.getJob(id);
    if (!job) {
       this.emit('queue.error', { queueName: this.queueName, error: `Job ${id.value} not found to add log.` });
      return;
    }
    // Worker check might be too strict if system wants to add logs. For now, assume logs come from active worker.
    if (job.status === JobStatus.ACTIVE && job.workerId !== workerId) {
         this.emit('queue.error', { queueName: this.queueName, error: `Cannot add log for job ${id.value} by worker ${workerId}, locked by ${job.workerId}.`, job });
        return;
    }
    job.addLog(logEntry.message, logEntry.level, logEntry.timestamp);
    // TODO: Implement IJobRepository.addLog for efficiency. Using full update for now.
    await this.jobRepository.update(job as JobEntity<unknown, unknown>);
    this.emit('job.log_added', { jobId: id.value, logEntry, queueName: this.queueName, job });
  }

  public startMaintenance(): void {
    if (this._isClosed || this.stalledJobsCheckIntervalId) {
      return;
    }
    this.stalledJobsCheckIntervalId = setInterval(
      () => this.checkForStalledJobs().catch(err => {
        this.emit('queue.error', { queueName: this.queueName, error: `Error in stalled job check: ${err.message || err}` });
      }),
      this._stalledCheckIntervalMs,
    );
    this.emit('queue.maintenance.started', { queueName: this.queueName, interval: this._stalledCheckIntervalMs });
  }

  private async checkForStalledJobs(): Promise<void> {
    if (this._isPaused || this._isClosed) return;

    const olderThan = new Date(Date.now() - this._stalledOlderThanMs);
    const stalledJobs = await this.jobRepository.findStalledJobs(
      this.queueName,
      olderThan,
      this._stalledLimitPerCheck,
    );

    if (stalledJobs.length > 0) {
        this.emit('queue.stalled_check', { queueName: this.queueName, count: stalledJobs.length, olderThan });
    }

    for (const job of stalledJobs) {
      const typedJob = job as JobEntity<P, R>;
      const originalWorkerId = typedJob.workerId;
      this.emit('job.stalled', { jobId: typedJob.id.value, workerId: originalWorkerId, queueName: this.queueName, job: typedJob });

      const shouldFailPermanently = typedJob.markAsStalled(); // This method should handle attempt counting for stalls if applicable

      if (shouldFailPermanently) {
        // markAsStalled already set status to FAILED if it's permanent
        this.emit('job.failed', { jobId: typedJob.id.value, error: typedJob.failedReason || 'Job failed after being marked as stalled and exceeding limits.', queueName: this.queueName, job: typedJob });
      } else {
        // If not failed permanently by markAsStalled, decide next step:
        // Check if it has attempts left for normal processing
        if (typedJob.attemptsMade < typedJob.maxAttempts) {
            // It can be retried. Calculate backoff for the stall.
            const delay = calculateBackoff(typedJob.attemptsMade, typedJob.options.backoff, true); // true for stalled
            if (delay > 0) {
                typedJob.moveToDelayed(new Date(Date.now() + delay), 'Job recovered from stall, will retry after delay.');
                this.emit('job.retrying', { jobId: typedJob.id.value, delay, attempt: typedJob.attemptsMade, error: 'stalled', queueName: this.queueName, job: typedJob });
            } else {
                // No delay, move to WAITING
                typedJob.moveToWaiting();
                this.emit('job.requeued_after_stall', { jobId: typedJob.id.value, queueName: this.queueName, job: typedJob });
            }
        } else {
            // No attempts left, should have been caught by markAsStalled.
            // If somehow it reaches here, mark as failed.
            typedJob.markAsFailed('Job stalled and has no attempts left.');
            this.emit('job.failed', { jobId: typedJob.id.value, error: typedJob.failedReason, queueName: this.queueName, job: typedJob });
        }
      }
      await this.jobRepository.update(typedJob as JobEntity<unknown, unknown>);
    }
  }
}
