import { IJobRepository } from '@/core/application/ports/job-repository.interface';
import { AbstractQueue } from '@/core/application/queue/abstract-queue';
import { JobEntity, JobStatus } from '@/core/domain/job/job.entity';
import { JobIdVO } from '@/core/domain/job/value-objects/job-id.vo';
import { IJobOptions } from '@/core/domain/job/value-objects/job-options.vo';

export class QueueService<P, R> extends AbstractQueue<P, R> {
  // private stalledJobsManager: Timeout | null = null; // Use Timeout type - Replaced by new mechanism
  private _isMaintenanceRunning: boolean = false;
  private maintenanceLoopPromise: Promise<void> | null = null;
  private readonly maintenanceIntervalMs: number = 15000;

  constructor(
    queueName: string,
    jobRepository: IJobRepository,
    defaultJobOptions?: IJobOptions,
  ) {
    super(queueName, jobRepository, defaultJobOptions);
  }

  async add(jobName: string, data: P, opts?: IJobOptions): Promise<JobEntity<P, R>> {
    const job = JobEntity.create<P, R>({ queueName: this.queueName, name: jobName, payload: data, options: { ...this.defaultJobOptions.toPersistence(), ...opts } });
    await this.jobRepository.save(job);
    this.emit('job.added', job);
    return job;
  }

  async addBulk(jobs: Array<{ name: string; data: P; opts?: IJobOptions }>): Promise<Array<JobEntity<P, R>>> {
    const jobEntities = jobs.map(jobDef => JobEntity.create<P, R>({ queueName: this.queueName, name: jobDef.name, payload: jobDef.data, options: { ...this.defaultJobOptions.toPersistence(), ...jobDef.opts } }));
    for (const job of jobEntities) {
      await this.jobRepository.save(job);
      this.emit('job.added', job);
    }
    return jobEntities;
  }

  async getJob(jobId: string | JobIdVO): Promise<JobEntity<P, R> | null> {
    const id = jobId instanceof JobIdVO ? jobId : JobIdVO.create(jobId);
    return await this.jobRepository.findById(id) as JobEntity<P, R> | null;
  }

  async getJobsByStatus(statuses: JobStatus[], start?: number, end?: number, asc?: boolean): Promise<Array<JobEntity<P, R>>> {
    return await this.jobRepository.getJobsByStatus(this.queueName, statuses, start, end, asc) as Array<JobEntity<P, R>>;
  }

  async countJobsByStatus(statuses?: JobStatus[]): Promise<Partial<Record<JobStatus, number>>> {
    return await this.jobRepository.countJobsByStatus(this.queueName, statuses);
  }

  async pause(): Promise<void> {
    // This should ideally be a state in the queue itself, not on each job.
    // For now, we'll just stop processing new jobs.
    this.emit('queue.paused');
  }

  async resume(): Promise<void> {
    this.emit('queue.resumed');
  }

  async clean(gracePeriodMs: number, limit: number, status?: JobStatus): Promise<number> {
    return await this.jobRepository.clean(this.queueName, gracePeriodMs, limit, status);
  }

  public async stopMaintenance(): Promise<void> {
    if (!this._isMaintenanceRunning && !this.maintenanceLoopPromise) {
      return;
    }
    this._isMaintenanceRunning = false;
    if (this.maintenanceLoopPromise) {
      try {
        await this.maintenanceLoopPromise;
      } catch (error) {
         this.emit('queue.error', new Error(`Error during maintenance loop stop: ${error instanceof Error ? error.message : String(error)}`));
      }
    }
    this.maintenanceLoopPromise = null;
  }

  public async close(): Promise<void> {
    await this.stopMaintenance();
    this.emit('queue.closed');
  }

  async fetchNextJobAndLock(workerId: string, lockDurationMs: number): Promise<JobEntity<P, R> | null> {
    console.log(`[QueueService] Attempting to fetch next job for worker ${workerId}...`);
    const jobs = await this.jobRepository.findNextJobsToProcess(this.queueName, 1);
    if (jobs.length === 0) {
      console.log(`[QueueService] No jobs found for worker ${workerId}.`);
      return null;
    }

    const job = jobs[0] as JobEntity<P, R>;
    console.log(`[QueueService] Found job ${job.id.value}. Attempting to acquire lock...`);
    const lockUntil = new Date(Date.now() + lockDurationMs);
    const locked = await this.jobRepository.acquireLock(job.id, workerId, lockUntil);

    if (locked) {
      console.log(`[QueueService] Lock acquired for job ${job.id.value}. Moving to active.`);
      job.moveToActive(workerId, lockUntil);
      await this.jobRepository.update(job);
      this.emit('job.active', job);
      return job;
    }
      console.log(`[QueueService] Failed to acquire lock for job ${job.id.value}.`);
      return null;

  }

  async extendJobLock(jobId: string | JobIdVO, workerId: string, lockDurationMs: number): Promise<void> {
    const id = jobId instanceof JobIdVO ? jobId : JobIdVO.create(jobId);
    const job = await this.getJob(id);
    if (job && job.workerId === workerId && job.status === JobStatus.ACTIVE) {
      const newLockUntil = new Date(Date.now() + lockDurationMs);
      job.extendLock(newLockUntil, workerId);
      await this.jobRepository.update(job);
      this.emit('job.lock.extended', job);
    }
  }

  async markJobAsCompleted(jobId: string | JobIdVO, workerId: string, result: R, _jobInstanceWithChanges?: JobEntity<P, R>): Promise<void> { // Param removed/ignored
    const id = jobId instanceof JobIdVO ? jobId : JobIdVO.create(jobId);
    const job = await this.getJob(id);
    if (job && job.workerId === workerId) { // Ensure job is still locked by this worker
      // It's possible the job was marked stalled and lock released by maintenance
      // Or completed/failed by another process if logic allows (though typically not)
      // For robustness, one might re-check job.status before marking completed.
      // However, JobEntity.markAsCompleted already logs a warning if not ACTIVE.
      job.markAsCompleted(result);
      await this.jobRepository.update(job);
      this.emit('job.completed', job);
    }
  }

  async markJobAsFailed(jobId: string | JobIdVO, workerId: string, error: Error, _jobInstanceWithChanges?: JobEntity<P, R>): Promise<void> { // Param removed/ignored
    const id = jobId instanceof JobIdVO ? jobId : JobIdVO.create(jobId);
    const job = await this.getJob(id);
    if (job && job.workerId === workerId) { // Ensure job is still locked by this worker
      if (job.attemptsMade < job.maxAttempts) {
        const delay = job.options.backoff?.delay || 1000;
        const backoff = job.options.backoff?.type === 'exponential' ? delay * Math.pow(2, job.attemptsMade - 1) : delay;
        job.moveToDelayed(new Date(Date.now() + backoff), error);
      } else {
        job.markAsFailed(error.message, error.stack?.split('\n'));
      }
      await this.jobRepository.update(job);
      this.emit('job.failed', job);
    }
  }

  async updateJobProgress(jobId: string | JobIdVO, workerId: string, progress: number | object): Promise<void> {
    const id = jobId instanceof JobIdVO ? jobId : JobIdVO.create(jobId);
    const job = await this.getJob(id);
    if (job && job.workerId === workerId) {
      job.updateProgress(progress);
      await this.jobRepository.update(job);
      this.emit('job.progress', job);
    }
  }

  async addJobLog(jobId: string | JobIdVO, workerId: string, message: string, level?: string): Promise<void> {
    const id = jobId instanceof JobIdVO ? jobId : JobIdVO.create(jobId);
    const job = await this.getJob(id);
    if (job && job.workerId === workerId) {
      job.addLog(message, level);
      await this.jobRepository.update(job);
      this.emit('job.log', job);
    }
  }

  public startMaintenance(): void { // Made public for consistency
    if (this._isMaintenanceRunning) return;
    this._isMaintenanceRunning = true;
    this.maintenanceLoopPromise = this.runMaintenanceLoop();
    // console.log('[QueueService] Maintenance loop started.');
  }

  private async runMaintenanceLoop(): Promise<void> {
    while (this._isMaintenanceRunning) {
      try {
        // console.log('[QueueService] Running stalled job check...');
        const stalledJobs = await this.jobRepository.findStalledJobs(this.queueName, new Date(), 10);
        if (stalledJobs.length > 0) {
            // console.log(`[QueueService] Found ${stalledJobs.length} stalled jobs.`);
        }
        for (const job of stalledJobs) {
          const jobEntity = job as JobEntity<P,R>; // Cast for type safety with entity methods
          // console.log(`[QueueService] Processing stalled job ${jobEntity.id.value}, status: ${jobEntity.status}, attempts: ${jobEntity.attemptsMade}`);
          const wasAlreadyFailedByStallLogic = jobEntity.markAsStalled();

          if (!wasAlreadyFailedByStallLogic) {
            jobEntity.moveToWaiting();
            // console.log(`[QueueService] Stalled job ${jobEntity.id.value} moved to WAITING.`);
          } else {
            // markAsStalled already set it to FAILED
            // console.log(`[QueueService] Stalled job ${jobEntity.id.value} marked as FAILED by entity logic.`);
          }
          await this.jobRepository.update(jobEntity);
          this.emit('job.stalled', jobEntity);
        }
      } catch (error) {
        console.error('[QueueService] Error during stalled job maintenance:', error);
        this.emit('queue.error', new Error(`Stalled job maintenance error: ${error instanceof Error ? error.message : String(error)}`));
      }

      if (this._isMaintenanceRunning) { // Check again before sleeping
        try {
            await new Promise(resolve => setTimeout(resolve, this.maintenanceIntervalMs));
        } catch (error) { // Should not happen with setTimeout
            console.error('[QueueService] Error during maintenance sleep:', error);
        }
      }
    }
    // console.log('[QueueService] Maintenance loop stopped.');
  }
}