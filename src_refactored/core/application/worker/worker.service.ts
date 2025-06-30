// src_refactored/core/application/worker/worker.service.ts
import { randomUUID } from 'node:crypto';
import EventEmitter from 'node:events';

import { AbstractQueue } from '@/core/application/queue/abstract-queue';
import { JobEntity } from '@/core/domain/job/job.entity';

import { ProcessorFunction, WorkerOptions } from './worker.types';

export class WorkerService<P, R> extends EventEmitter {
  public readonly workerId: string;
  private _isRunning: boolean = false;
  private _isClosed: boolean = false;
  private _activeJobs: number = 0;
  private lockRenewTimers: Map<string, Timeout> = new Map();
  private pollLoopPromise: Promise<void> | null = null;
  private readonly pollingIntervalMs: number = 1000;

  constructor(
    protected readonly queue: AbstractQueue<P, R>,
    protected readonly processor: ProcessorFunction<P, R>,
    protected readonly opts: WorkerOptions = { lockDuration: 30000 },
  ) {
    super();
    this.workerId = randomUUID();
    if (opts.concurrency && opts.concurrency > 1) {
        console.warn(`[WorkerService] Concurrency option > 1 is not supported in this sequential version. Effective concurrency is 1.`);
    }
  }

  get isRunning(): boolean { return this._isRunning; }
  get isClosed(): boolean { return this._isClosed; }
  get activeJobCount(): number { return this._activeJobs; }

  public run(): void {
    if (this._isRunning || this._isClosed) return;
    this._isRunning = true;
    this.pollLoopPromise = this.poll();
  }

  public async close(): Promise<void> {
    if (this._isClosed) return;

    this._isRunning = false;
    this._isClosed = true;

    if (this.pollLoopPromise) {
        try {
            await this.pollLoopPromise;
        } catch (error) {
            this.emit('worker.error', new Error(`Error during poll loop shutdown: ${error instanceof Error ? error.message : String(error)}`));
        }
    }

    const gracefulShutdownTimeout = this.opts.lockDuration ? this.opts.lockDuration * 2 : 60000;
    const startTime = Date.now();
    while (this._activeJobs > 0 && (Date.now() - startTime < gracefulShutdownTimeout)) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    if (this._activeJobs > 0) {
        this.emit('worker.error', new Error(`Worker closed with ${this._activeJobs} active job(s) still running after timeout.`));
    }

    this.lockRenewTimers.forEach(timer => clearInterval(timer));
    this.lockRenewTimers.clear();
    this.emit('worker.closed');
  }

  private async poll(): Promise<void> {
    while (this._isRunning && !this._isClosed) {
      if (this._activeJobs !== 0) {
        await new Promise(resolve => setTimeout(resolve, this.pollingIntervalMs));
        continue;
      }

      try {
        const job = await this.queue.fetchNextJobAndLock(this.workerId, this.opts.lockDuration ?? 30000);

        if (!job) {
          await new Promise(resolve => setTimeout(resolve, this.pollingIntervalMs));
          continue;
        }

        if (!this._isRunning || this._isClosed) {
          console.warn(`[WorkerService] Worker stopped while job ${job.id.value} was fetched. Job may become stalled.`);
          break;
        }

        this._activeJobs = 1;
        await this.processJob(job);

      } catch (error) {
        this.emit('worker.error', error);
        await new Promise(resolve => setTimeout(resolve, this.pollingIntervalMs * 2));
      }
    }
  }

  private async processJob(job: JobEntity<P, R>): Promise<void> {
    const originalUpdateProgress = job.updateProgress.bind(job);
    job.updateProgress = (progress: number | object) => {
      originalUpdateProgress(progress);
      this.queue.updateJobProgress(job.id, this.workerId, progress).catch(err => {
          this.emit('worker.error', new Error(`Failed to update progress for job ${job.id.value}: ${err instanceof Error ? err.message : String(err)}`));
      });
    };

    const originalAddLog = job.addLog.bind(job);
    job.addLog = (message: string, level?: string) => {
      originalAddLog(message, level);
      this.queue.addJobLog(job.id, this.workerId, message, level).catch(err => {
          this.emit('worker.error', new Error(`Failed to add log for job ${job.id.value}: ${err instanceof Error ? err.message : String(err)}`));
      });
    };

    this.emit('worker.job.active', job);
    this.setupLockRenewal(job);

    try {
      const result = await this.processor(job);

      if (this._isClosed && !job.finishedOn) {
         this.emit('worker.job.interrupted', job);
      } else if (!this._isClosed) {
        await this.queue.markJobAsCompleted(job.id, this.workerId, result, job);
        this.emit('worker.job.processed', job, result);
      }
    } catch (error) {
      if (!this._isClosed) {
        await this.queue.markJobAsFailed(job.id, this.workerId, error as Error, job);
        this.emit('worker.job.errored', job, error);
      } else {
        this.emit('worker.job.interrupted', job, error);
      }
    } finally {
      this._activeJobs = 0;
      this.clearLockRenewal(job.id.value);
      job.updateProgress = originalUpdateProgress;
      job.addLog = originalAddLog;
    }
  }

  private setupLockRenewal(job: JobEntity<P, R>): void {
    const renewBuffer = this.opts.lockRenewTimeBuffer ?? this.opts.lockDuration / 2;
    const renewInterval = this.opts.lockDuration - renewBuffer;

    const timer = setInterval(() => {
      this.queue.extendJobLock(job.id, this.workerId, this.opts.lockDuration);
    }, renewInterval);

    this.lockRenewTimers.set(job.id.value, timer);
  }

  private clearLockRenewal(jobId: string): void {
    const timer = this.lockRenewTimers.get(jobId);
    if (timer) {
      clearInterval(timer);
      this.lockRenewTimers.delete(jobId);
    }
  }
}