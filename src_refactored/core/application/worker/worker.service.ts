// src_refactored/core/application/worker/worker.service.ts
import EventEmitter from 'node:events';
import { randomUUID } from 'node:crypto';
import { AbstractQueue } from '@/core/application/queue/abstract-queue';
import { JobEntity } from '@/core/domain/job/job.entity';
import { ProcessorFunction, WorkerOptions } from './worker.types';

export class WorkerService<P, R> extends EventEmitter {
  public readonly workerId: string; // Made public for easier testing if needed, though not strictly necessary
  private _isRunning: boolean = false;
  private _isClosed: boolean = false;
  private _activeJobs: number = 0;
  private lockRenewTimers: Map<string, NodeJS.Timeout> = new Map();

  constructor(
    protected readonly queue: AbstractQueue<P, R>,
    protected readonly processor: ProcessorFunction<P, R>,
    protected readonly opts: WorkerOptions = { concurrency: 1, lockDuration: 30000 },
  ) {
    super();
    this.workerId = randomUUID();
  }

  get isRunning(): boolean { return this._isRunning; }
  get isClosed(): boolean { return this._isClosed; }
  get activeJobCount(): number { return this._activeJobs; }


  public run(): void {
    if (this._isRunning || this._isClosed) return;
    this._isRunning = true;
    this.poll();
  }

  public async close(): Promise<void> {
    if (this._isClosed) return;
    this._isRunning = false; // Stop polling for new jobs
    this._isClosed = true;   // Mark as closed

    // Wait for active jobs to finish
    // A more robust solution might involve a Promise that resolves when all jobs are done.
    while (this._activeJobs > 0) {
      await new Promise(resolve => setTimeout(resolve, 50)); // Check more frequently
    }
    this.lockRenewTimers.forEach(timer => clearInterval(timer));
    this.lockRenewTimers.clear();
    this.emit('worker.closed');
  }

  private async poll(): Promise<void> {
    if (!this._isRunning || this._isClosed) return;

    if (this._activeJobs < this.opts.concurrency) {
      try {
        const job = await this.queue.fetchNextJobAndLock(this.workerId, this.opts.lockDuration);
        if (job) {
          if (!this._isRunning || this._isClosed) { // Re-check in case worker was closed while fetching
            // If closed, try to release the lock or move job back to waiting.
            // This is a complex scenario; for now, we might just ignore processing.
            // Or better, the queue should handle this if a worker takes a job and dies.
            // For now, we'll assume if a job is fetched, it's processed unless an error occurs.
            return;
          }
          this._activeJobs++;
          this.processJob(job); // Do not await, let it run concurrently
        }
      } catch (error) {
        this.emit('worker.error', error); // Error fetching job
      }
    }

    if (this._isRunning && !this._isClosed) {
      setTimeout(() => this.poll(), 1000); // Poll every second
    }
  }

  private async processJob(job: JobEntity<P, R>): Promise<void> {
    // Bind job entity's updateProgress and addLog to the queue methods
    // This ensures that when the processor calls job.updateProgress or job.addLog,
    // it directly communicates with the queue service.
    const originalUpdateProgress = job.updateProgress.bind(job);
    job.updateProgress = (progress: number | object) => {
      originalUpdateProgress(progress);
      this.queue.updateJobProgress(job.id, this.workerId, progress);
    };

    const originalAddLog = job.addLog.bind(job);
    job.addLog = (message: string, level?: string) => {
      originalAddLog(message, level);
      this.queue.addJobLog(job.id, this.workerId, message, level);
    };

    this.emit('worker.job.active', job);
    this.setupLockRenewal(job);

    try {
      const result = await this.processor(job); // User's processing logic
      if (this._isClosed && !job.finishedOn) { // If worker closed during processing
         this.emit('worker.job.interrupted', job); // A new event to indicate this state
         // Job was not completed nor failed from processor's perspective due to shutdown
         // The Queue's stalled job mechanism should eventually pick this up if lock expires.
         // Or, QueueService.markJobAsFailed could be called with a specific "interrupted" error.
         // For now, we rely on lock expiration and stalled job handling.
      } else {
        await this.queue.markJobAsCompleted(job.id, this.workerId, result, job);
        this.emit('worker.job.processed', job, result);
      }
    } catch (error) {
      if (!this._isClosed) { // Only mark as failed if not part of a shutdown interruption
        await this.queue.markJobAsFailed(job.id, this.workerId, error as Error, job);
        this.emit('worker.job.errored', job, error);
      } else {
        this.emit('worker.job.interrupted', job, error); // Error during processing, but worker was closing
      }
    } finally {
      this._activeJobs--;
      this.clearLockRenewal(job.id.value);
      // Restore original methods if necessary, though job instance is typically short-lived here
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