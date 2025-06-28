// src_refactored/core/application/queue/queue-scheduler.service.ts
import { Timeout } from 'node:timers'; // Ensure Timeout is imported if NodeJS.Timeout is not global for linter

import { injectable, inject } from 'inversify';

import { IJobEventEmitter, JOB_EVENT_EMITTER_TOKEN } from '@/core/application/ports/events/i-job-event-emitter.interface';
import { ILoggerService, LoggerServiceToken } from '@/core/common/services/i-logger.service';
// JobEntity and JobEntityConstructionProps are not directly used in this file after refactoring repeatable jobs to placeholder
// import { JobEntity, JobEntityConstructionProps } from '@/core/domain/job/job.entity';
import { IJobRepository, JOB_REPOSITORY_TOKEN } from '@/core/domain/job/ports/job-repository.interface';
import { JobIdVO } from '@/core/domain/job/value-objects/job-id.vo';
import { JobStatusEnum } from '@/core/domain/job/value-objects/job-status.vo';


const DEFAULT_SCHEDULER_INTERVAL_MS = 5000;
const DEFAULT_PROCESSING_LIMIT_PER_CYCLE = 50;

@injectable()
export class QueueSchedulerService {
  private intervalId?: Timeout; // Changed NodeJS.Timeout to Timeout
  private isRunning: boolean = false;
  private processingLimit: number;

  constructor(
    @inject(JOB_REPOSITORY_TOKEN) private readonly jobRepository: IJobRepository,
    @inject(JOB_EVENT_EMITTER_TOKEN) private readonly jobEventEmitter: IJobEventEmitter,
    @inject(LoggerServiceToken) private readonly logger: ILoggerService,
    options?: { intervalMs?: number; processingLimit?: number }
  ) {
    this.processingLimit = options?.processingLimit || DEFAULT_PROCESSING_LIMIT_PER_CYCLE;
    const intervalMs = options?.intervalMs || DEFAULT_SCHEDULER_INTERVAL_MS;

    this.start(intervalMs);
    this.logger.info(`[QueueSchedulerService] Initialized. Cycle interval: ${intervalMs}ms, Processing limit: ${this.processingLimit}`);
  }

  public start(intervalMs: number = DEFAULT_SCHEDULER_INTERVAL_MS): void {
    if (this.isRunning) {
      this.logger.warn('[QueueSchedulerService] Scheduler is already running.');
      return;
    }
    this.isRunning = true;
    this.intervalId = setInterval(() => this.runCycle(), intervalMs);
    this.logger.info(`[QueueSchedulerService] Started with interval ${intervalMs}ms.`);
  }

  public stop(): void {
    if (!this.isRunning) {
      this.logger.warn('[QueueSchedulerService] Scheduler is not running.');
      return;
    }
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
    this.isRunning = false;
    this.logger.info('[QueueSchedulerService] Stopped.');
  }

  public async runCycle(): Promise<void> {
    if (!this.isRunning) return;

    this.logger.debug('[QueueSchedulerService] Starting new cycle.');
    const now = Date.now();

    try {
      await this.promoteDelayedJobs(now);
      await this.handleStalledJobs(now);
      await this.processRepeatableJobs(now);
      await this.checkJobDependencies(now);
    } catch (error: unknown) { // Single try-catch for the whole cycle
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error('[QueueSchedulerService] Error during runCycle:', err);
    }
    this.logger.debug('[QueueSchedulerService] Cycle finished.');
  }

  private async promoteDelayedJobs(currentTimeMs: number): Promise<void> {
    this.logger.debug(`[QueueSchedulerService] Promoting delayed jobs (time: ${new Date(currentTimeMs).toISOString()})...`);
    try {
      const result = await this.jobRepository.findDelayedJobsToPromote(
        currentTimeMs,
        this.processingLimit,
      );

      if (result.isError()) {
        this.logger.error('[QueueSchedulerService] Error fetching delayed jobs to promote:', result.error);
        return;
      }

      const jobsToPromote = result.value;
      if (jobsToPromote.length === 0) {
        this.logger.debug('[QueueSchedulerService] No delayed jobs to promote at this time.');
        return;
      }

      this.logger.info(`[QueueSchedulerService] Found ${jobsToPromote.length} delayed job(s) to promote.`);

      for (const job of jobsToPromote) {
        if (!this.isRunning) break;

        const originalStatus = job.status.value;
        if (job.promoteToPending()) {
          const saveResult = await this.jobRepository.save(job);
          if (saveResult.isSuccess()) {
            this.logger.info(`[QueueSchedulerService] Promoted job ${job.id.value} from ${originalStatus} to PENDING.`);
            this.jobEventEmitter.emit('job.promoted', {
              queueName: job.queueName,
              jobId: job.id.value,
            });
          } else {
            this.logger.error(`[QueueSchedulerService] Failed to save promoted job ${job.id.value}:`, saveResult.error);
          }
        } else {
          this.logger.warn(`[QueueSchedulerService] Job ${job.id.value} could not be promoted (current status: ${job.status.value}).`);
        }
      }
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error('[QueueSchedulerService] Exception in promoteDelayedJobs:', err);
    }
  }

  private async handleStalledJobs(currentTimeMs: number): Promise<void> {
    this.logger.debug(`[QueueSchedulerService] Handling stalled jobs (time: ${new Date(currentTimeMs).toISOString()})...`);
    try {
      const result = await this.jobRepository.findStalledJobs(
        currentTimeMs,
        this.processingLimit,
      );

      if (result.isError()) {
        this.logger.error('[QueueSchedulerService] Error fetching stalled jobs:', result.error);
        return;
      }

      const stalledJobs = result.value;
      if (stalledJobs.length === 0) {
        this.logger.debug('[QueueSchedulerService] No stalled jobs found at this time.');
        return;
      }

      this.logger.info(`[QueueSchedulerService] Found ${stalledJobs.length} stalled job(s) to handle.`);

      for (const job of stalledJobs) {
        if (!this.isRunning) break;

        this.logger.warn(`[QueueSchedulerService] Job ${job.id.value} (queue: ${job.queueName}) is stalled. Last processed by ${job.lockedByWorkerId} with lock expired at ${job.lockExpiresAt?.toISOString()}.`);

        this.jobEventEmitter.emit('job.stalled', {
          queueName: job.queueName,
          jobId: job.id.value,
        });

        const currentAttempts = job.attemptsMade;
        const maxAttempts = job.opts.attempts;

        if (currentAttempts < maxAttempts) {
          this.logger.info(`[QueueSchedulerService] Retrying stalled job ${job.id.value} (attempt ${currentAttempts + 1}/${maxAttempts}).`);
          let retryDelayMs = 1000 * Math.pow(2, currentAttempts);
          const backoffOpts = job.opts.retryStrategy?.backoff;
          if (backoffOpts) {
            if (backoffOpts.type === 'fixed') {
              retryDelayMs = backoffOpts.delayMs;
            } else if (backoffOpts.type === 'exponential') {
              retryDelayMs = backoffOpts.delayMs * Math.pow(2, currentAttempts);
            }
          }
          job.moveToDelayed(Date.now() + retryDelayMs);
          job.failedReason = `Stalled (attempt ${currentAttempts})`;
        } else {
          this.logger.error(`[QueueSchedulerService] Stalled job ${job.id.value} reached max attempts (${maxAttempts}). Marking as FAILED.`);
          job.moveToFailed(`Stalled after ${maxAttempts} attempts; lock expired.`);
        }

        const saveResult = await this.jobRepository.save(job);
        if (saveResult.isSuccess()) {
          if (job.status.is(JobStatusEnum.FAILED)) {
            this.jobEventEmitter.emit('job.failed', {
              queueName: job.queueName,
              jobId: job.id.value,
              error: new Error(job.failedReason || 'Stalled and failed'),
              job: job,
            });
          } else if (job.status.is(JobStatusEnum.DELAYED) && job.processAt) {
            this.jobEventEmitter.emit('job.delayed', {
              queueName: job.queueName,
              jobId: job.id.value,
              delayUntil: job.processAt.getTime(),
            });
          }
        } else {
          this.logger.error(`[QueueSchedulerService] Failed to save updated state for stalled job ${job.id.value}:`, saveResult.error);
        }
      }
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error('[QueueSchedulerService] Exception in handleStalledJobs:', err);
    }
  }

  private async processRepeatableJobs(currentTimeMs: number): Promise<void> {
    this.logger.debug(`[QueueSchedulerService] Processing repeatable jobs (time: ${new Date(currentTimeMs).toISOString()})...`);
    this.logger.warn(`[QueueSchedulerService] Repeatable job processing is currently basic and relies on 'opts.repeat.every' from completed jobs. Full CRON support, limits, and robust duplicate prevention require the 'repeatable_job_schedules' table or enhanced job fields.`);

    try {
      // Placeholder logic as discussed.
      this.logger.debug("[QueueSchedulerService] Repeatable job logic is a placeholder due to complexity without a dedicated schedule table/fields.");
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error('[QueueSchedulerService] Exception in processRepeatableJobs:', err);
    }
  }

  private async checkJobDependencies(currentTimeMs: number): Promise<void> {
    this.logger.debug(`[QueueSchedulerService] Checking job dependencies (time: ${new Date(currentTimeMs).toISOString()})...`);
    try {
      const waitingJobsResult = await this.jobRepository.search(
        { status: JobStatusEnum.WAITING_CHILDREN },
        { limit: this.processingLimit }
      );

      if (waitingJobsResult.isError()) {
        this.logger.error('[QueueSchedulerService] Error fetching jobs in WAITING_CHILDREN state:', waitingJobsResult.error);
        return;
      }

      const waitingJobs = waitingJobsResult.value.jobs;
      if (waitingJobs.length === 0) {
        this.logger.debug('[QueueSchedulerService] No jobs found in WAITING_CHILDREN state.');
        return;
      }

      this.logger.info(`[QueueSchedulerService] Found ${waitingJobs.length} job(s) in WAITING_CHILDREN state.`);

      for (const job of waitingJobs) {
        if (!this.isRunning) break;
        if (!job.opts.dependsOnJobIds || job.opts.dependsOnJobIds.length === 0) {
          this.logger.warn(`[QueueSchedulerService] Job ${job.id.value} is WAITING_CHILDREN but has no dependsOnJobIds. Promoting.`);
          job.promoteToPending();
          const saveResult = await this.jobRepository.save(job);
          if (saveResult.isSuccess()) {
            this.jobEventEmitter.emit('job.promoted', { queueName: job.queueName, jobId: job.id.value });
          } else {
            this.logger.error(`[QueueSchedulerService] Failed to save promoted job ${job.id.value} (was WAITING_CHILDREN with no deps):`, saveResult.error);
          }
          continue;
        }

        const dependencyIds = job.opts.dependsOnJobIds.map(idStr => JobIdVO.create(idStr));
        const depsResult = await this.jobRepository.findByIds(dependencyIds);

        if (depsResult.isError()) {
          this.logger.error(`[QueueSchedulerService] Error fetching dependencies for job ${job.id.value}:`, depsResult.error);
          continue;
        }

        const dependentJobs = depsResult.value;
        if (dependentJobs.length !== dependencyIds.length) {
            const foundIds = dependentJobs.map(dj => dj.id.value);
            const missingIds = dependencyIds.map(dId => dId.value).filter(id => !foundIds.includes(id));
            this.logger.warn(`[QueueSchedulerService] Job ${job.id.value} has missing dependencies: ${missingIds.join(', ')}. Cannot promote yet.`);
            continue;
        }

        const allDependenciesCompleted = dependentJobs.every(depJob => depJob.status.is(JobStatusEnum.COMPLETED));

        if (allDependenciesCompleted) {
          this.logger.info(`[QueueSchedulerService] All dependencies for job ${job.id.value} are completed. Promoting.`);
          job.promoteToPending();
          const saveResult = await this.jobRepository.save(job);
          if (saveResult.isSuccess()) {
            this.jobEventEmitter.emit('job.promoted', {
              queueName: job.queueName,
              jobId: job.id.value,
            });
          } else {
            this.logger.error(`[QueueSchedulerService] Failed to save promoted job ${job.id.value} after dependencies met:`, saveResult.error);
          }
        } else {
          this.logger.debug(`[QueueSchedulerService] Job ${job.id.value} still waiting for dependencies to complete.`);
        }
      }
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error('[QueueSchedulerService] Exception in checkJobDependencies:', err);
    }
  }
}
