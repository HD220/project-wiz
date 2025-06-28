// src_refactored/core/application/queue/job-worker.service.ts
import { injectable, inject } from 'inversify';
import { v4 as uuidv4 } from 'uuid';
import { Timeout } from 'node:timers'; // Import Timeout

import { IJobEventEmitter, JOB_EVENT_EMITTER_TOKEN } from '@/core/application/ports/events/i-job-event-emitter.interface';
import { ILoggerService, LoggerServiceToken } from '@/core/common/services/i-logger.service';
import { JobEntity } from '@/core/domain/job/job.entity';
import { IJobRepository, JOB_REPOSITORY_TOKEN } from '@/core/domain/job/ports/job-repository.interface';
import { JobStatusEnum } from '@/core/domain/job/value-objects/job-status.vo';

import { WorkerOptions } from './dtos/worker-options.dto';
import { ProcessorFunction } from './queue.types';


const DEFAULT_WORKER_OPTIONS: Required<WorkerOptions> = {
  concurrency: 1,
  lockDuration: 30000,
  lockRenewTime: 15000,
  autorun: true,
};

@injectable()
export class JobWorkerService<TData = unknown, TResult = unknown> {
  public readonly id: string;
  public readonly queueName: string;
  private opts: Required<WorkerOptions>;
  private isRunning: boolean = false;
  private isClosing: boolean = false;
  private activeJobs: number = 0;

  private jobRepository: IJobRepository;
  private jobEventEmitter: IJobEventEmitter;
  private logger: ILoggerService;

  constructor(
    queueName: string,
    private processor: ProcessorFunction<TData, TResult>,
    options?: WorkerOptions,
    @inject(JOB_REPOSITORY_TOKEN) jobRepository?: IJobRepository,
    @inject(JOB_EVENT_EMITTER_TOKEN) jobEventEmitter?: IJobEventEmitter,
    @inject(LoggerServiceToken) logger?: ILoggerService,
  ) {
    this.id = `worker-${uuidv4()}`;
    this.queueName = queueName;

    this.jobRepository = jobRepository!;
    this.jobEventEmitter = jobEventEmitter!;
    this.logger = logger!;

    if (!this.jobRepository || !this.jobEventEmitter || !this.logger) {
        const missingDeps = [
            !jobRepository ? 'jobRepository' : null,
            !jobEventEmitter ? 'jobEventEmitter' : null,
            !logger ? 'logger' : null,
        ].filter(Boolean).join(', ');
        throw new Error(`JobWorkerService [${this.id}] for queue [${this.queueName}] is missing critical dependencies: ${missingDeps}`);
    }

    this.opts = { ...DEFAULT_WORKER_OPTIONS, ...options };

    if (this.opts.lockRenewTime > 0 && this.opts.lockRenewTime >= this.opts.lockDuration) {
      this.logger.warn(`[${this.id}] lockRenewTime (${this.opts.lockRenewTime}) should be less than lockDuration (${this.opts.lockDuration}). Adjusting lockRenewTime.`);
      this.opts.lockRenewTime = Math.max(1000, Math.floor(this.opts.lockDuration / 2));
    }

    this.logger.info(`[${this.id}] Worker created for queue [${this.queueName}] with concurrency ${this.opts.concurrency}`);

    if (this.opts.autorun) {
      this.run();
    }
  }

  public run(): void {
    if (this.isRunning || this.isClosing) {
      if (this.isRunning) this.logger.info(`[${this.id}] Worker is already running.`);
      if (this.isClosing) this.logger.info(`[${this.id}] Worker is closing, cannot start.`);
      return;
    }
    this.isRunning = true;
    this.logger.info(`[${this.id}] Worker started with concurrency: ${this.opts.concurrency}`);

    for (let slotIndex = 0; slotIndex < this.opts.concurrency; slotIndex++) {
      const pollFn = async () => {
        if (!this.isRunning || this.isClosing) return;

        if (this.activeJobs < this.opts.concurrency) {
          try {
            const job = await this.fetchNextJobAndLock();
            if (job) {
              this.activeJobs++;
              this.logger.info(`[${this.id}] Picked up job ${job.id.value} (slot ${slotIndex})`);
              this.processJobInternal(job).finally(() => {
                this.activeJobs--;
                this.logger.debug(`[${this.id}] Slot ${slotIndex} finished job ${job.id.value}, active jobs: ${this.activeJobs}`);
              });
            } else {
              await new Promise(resolve => setTimeout(resolve, 1000 + (slotIndex * 50)));
            }
          } catch (errorInPoll) {
            const err = errorInPoll instanceof Error ? errorInPoll : new Error(String(errorInPoll));
            this.logger.error(`[${this.id}] Critical error in polling/job acquisition for slot ${slotIndex}:`, err);
            this.jobEventEmitter.emit('worker.error', { queueName: this.queueName, workerId: this.id, error: err });
            await new Promise(resolve => setTimeout(resolve, 5000));
          }
        } else {
          await new Promise(resolve => setTimeout(resolve, 200 + (slotIndex * 20)));
        }
        if (this.isRunning && !this.isClosing) {
            setTimeout(pollFn, 0);
        }
      };
      setTimeout(pollFn, 0);
    }
  }

  private async fetchNextJobAndLock(): Promise<JobEntity<TData, TResult> | null> {
    if (!this.isRunning || this.isClosing) {
      return null;
    }
    this.logger.debug(`[${this.id}] Attempting to fetch and lock next job from queue [${this.queueName}]`);
    try {
      const now = Date.now();
      const result = await this.jobRepository.findAndLockProcessableJobs(
        this.queueName,
        this.id,
        1,
        now,
        this.opts.lockDuration,
      );

      if (result.isSuccess()) {
        const jobs = result.value as JobEntity<TData, TResult>[];
        if (jobs.length > 0) {
          this.logger.info(`[${this.id}] Fetched and locked job ${jobs[0].id.value}`);
          return jobs[0];
        }
        this.logger.debug(`[${this.id}] No processable jobs found in queue [${this.queueName}] at this time.`);
        return null;
      }
        this.logger.error(`[${this.id}] Error fetching processable jobs:`, result.error);
        this.jobEventEmitter.emit('worker.error', {
          queueName: this.queueName,
          workerId: this.id,
          error: result.error
        });
        return null;

    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error(`[${this.id}] Exception during fetchNextJobAndLock:`, err);
      this.jobEventEmitter.emit('worker.error', {
          queueName: this.queueName,
          workerId: this.id,
          error: err
      });
      return null;
    }
  }

  private async processJobInternal(job: JobEntity<TData, TResult>): Promise<void> {
    this.logger.info(`[${this.id}] Processing job ${job.id.value} (attempt ${job.attemptsMade})`);

    job._setActiveContext(this.jobRepository, this.jobEventEmitter);

    this.jobEventEmitter.emit('job.active', {
      queueName: this.queueName,
      jobId: job.id.value,
      job: job
    });

    let lockRenewIntervalId: Timeout | undefined; // Changed NodeJS.Timeout to Timeout

    try {
      if (this.opts.lockDuration > 0 && this.opts.lockRenewTime > 0 && this.opts.lockRenewTime < this.opts.lockDuration) {
        lockRenewIntervalId = setInterval(async () => {
          if (this.isClosing || !this.isRunning) {
            if (lockRenewIntervalId) clearInterval(lockRenewIntervalId);
            return;
          }
          const newLockExpiresAt = Date.now() + this.opts.lockDuration;
          if (job.renewLock(newLockExpiresAt, this.id)) {
            const saveResult = await this.jobRepository.save(job);
            if (saveResult.isSuccess()) {
              this.logger.debug(`[${this.id}] Renewed lock for job ${job.id.value} until ${new Date(newLockExpiresAt).toISOString()}`);
            } else {
              this.logger.error(`[${this.id}] Failed to save renewed lock for job ${job.id.value}:`, saveResult.error);
            }
          } else {
            this.logger.warn(`[${this.id}] Lock renewal condition not met for job ${job.id.value}. Stopping renewal attempts.`);
            if (lockRenewIntervalId) clearInterval(lockRenewIntervalId);
          }
        }, this.opts.lockRenewTime);
      }

      const result = await this.processor(job);

      if (lockRenewIntervalId) clearInterval(lockRenewIntervalId);
      lockRenewIntervalId = undefined;

      if (job.lockedByWorkerId !== this.id || (job.lockExpiresAt && job.lockExpiresAt.getTime() < Date.now())) {
        this.logger.warn(`[${this.id}] Lock lost or job reassigned for job ${job.id.value} before completion. Not marking as completed.`);
        job._clearActiveContext();
        return;
      }

      if (this.isClosing) {
        this.logger.warn(`[${this.id}] Worker is closing, job ${job.id.value} processed but not finalizing state.`);
        job._clearActiveContext();
        return;
      }

      job.moveToCompleted(result);
      const saveResult = await this.jobRepository.save(job);

      if (saveResult.isSuccess()) {
        this.logger.info(`[${this.id}] Job ${job.id.value} completed successfully.`);
        this.jobEventEmitter.emit('job.completed', {
          queueName: this.queueName,
          jobId: job.id.value,
          result: job.returnValue,
          job: job,
        });
        if (job.opts.removeOnComplete === true) {
          this.logger.info(`[${this.id}] Job ${job.id.value} marked for removal on complete.`);
          await this.jobRepository.delete(job.id);
          this.jobEventEmitter.emit('job.removed', { queueName: this.queueName, jobId: job.id.value });
        }
      } else {
        this.logger.error(`[${this.id}] Failed to save COMPLETED state for job ${job.id.value}:`, saveResult.error);
        this.jobEventEmitter.emit('worker.error', {
          queueName: this.queueName,
          workerId: this.id,
          error: new Error(`Failed to save COMPLETED state for job ${job.id.value}: ${saveResult.error.message}`)
        });
      }
    } catch (processingError: unknown) {
      if (lockRenewIntervalId) clearInterval(lockRenewIntervalId);

      const jobError = processingError instanceof Error ? processingError : new Error(String(processingError));
      this.logger.error(`[${this.id}] Error processing job ${job.id.value}:`, jobError);

      const currentAttempts = job.attemptsMade;
      const maxAttempts = job.opts.attempts;

      if (currentAttempts < maxAttempts) {
        let retryDelayMs = 1000 * Math.pow(2, currentAttempts -1);
        const backoffOpts = job.opts.retryStrategy?.backoff;
        if (backoffOpts) {
          if (backoffOpts.type === 'fixed') {
            retryDelayMs = backoffOpts.delayMs;
          } else if (backoffOpts.type === 'exponential') {
            retryDelayMs = backoffOpts.delayMs * Math.pow(2, currentAttempts - 1);
          }
        }

        this.logger.info(`[${this.id}] Job ${job.id.value} failed, will retry (attempt ${currentAttempts}/${maxAttempts}). Delay: ${retryDelayMs}ms`);
        job.moveToDelayed(Date.now() + retryDelayMs);
        job.failedReason = jobError.message;
      } else {
        this.logger.error(`[${this.id}] Job ${job.id.value} failed after ${currentAttempts} attempts (max ${maxAttempts}). Marking as FAILED.`);
        job.moveToFailed(jobError.message);
      }

      const saveFailStateResult = await this.jobRepository.save(job);
      if (saveFailStateResult.isSuccess()) {
        this.jobEventEmitter.emit('job.failed', {
          queueName: this.queueName,
          jobId: job.id.value,
          error: jobError,
          job: job,
        });
        if (job.status.is(JobStatusEnum.DELAYED) && job.processAt) {
          this.jobEventEmitter.emit('job.delayed', {
            queueName: this.queueName,
            jobId: job.id.value,
            delayUntil: job.processAt.getTime(),
          });
        }
        if (job.status.is(JobStatusEnum.FAILED) && job.opts.removeOnFail === true) {
          this.logger.info(`[${this.id}] Job ${job.id.value} marked for removal on fail.`);
          await this.jobRepository.delete(job.id);
           this.jobEventEmitter.emit('job.removed', { queueName: this.queueName, jobId: job.id.value });
        }
      } else {
        this.logger.error(`[${this.id}] Failed to save FAILED/DELAYED state for job ${job.id.value}:`, saveFailStateResult.error);
        this.jobEventEmitter.emit('worker.error', {
            queueName: this.queueName,
            workerId: this.id,
            error: new Error(`Failed to save FAILED/DELAYED state for job ${job.id.value}: ${saveFailStateResult.error.message}`)
        });
      }
    } finally {
      if (lockRenewIntervalId) {
        clearInterval(lockRenewIntervalId);
      }
      job._clearActiveContext();
    }
  }

  public async close(force: boolean = false): Promise<void> {
    this.logger.info(`[${this.id}] Worker closing (force: ${force})... Current active jobs: ${this.activeJobs}`);
    this.isClosing = true;
    this.isRunning = false;

    if (!force && this.activeJobs > 0) {
      this.logger.info(`[${this.id}] Waiting for ${this.activeJobs} active job(s) to complete...`);
      let attempts = 0;
      const maxAttempts = 60;
      while (this.activeJobs > 0 && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 500));
        attempts++;
        this.logger.debug(`[${this.id}] Still ${this.activeJobs} active job(s). Wait attempt ${attempts}/${maxAttempts}`);
      }
      if (this.activeJobs > 0) {
        this.logger.warn(`[${this.id}] Timed out waiting for ${this.activeJobs} job(s) to complete. Proceeding with close.`);
      } else {
        this.logger.info(`[${this.id}] All active jobs completed.`);
      }
    } else if (force && this.activeJobs > 0) {
        this.logger.warn(`[${this.id}] Forcing close with ${this.activeJobs} active job(s). These jobs may be interrupted or re-processed later.`);
    }

    this.logger.info(`[${this.id}] Worker closed.`);
  }
}
