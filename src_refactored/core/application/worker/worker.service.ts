// src_refactored/core/application/worker/worker.service.ts
import { randomUUID } from 'node:crypto';
import EventEmitter from 'node:events';

import { AbstractQueue } from '@/core/application/queue/abstract-queue';
import { JobEntity, JobStatus } from '@/core/domain/job/job.entity'; // Added JobStatus
// import { IJobOptions } from '@/core/domain/job/value-objects/job-options.vo'; // Not directly used in this file

import { ProcessorFunction, WorkerOptions } from './worker.types';

const DEFAULT_WORKER_OPTIONS: Required<WorkerOptions> = {
  concurrency: 1,
  lockDuration: 30 * 1000, // 30 seconds
  lockRenewTimeBuffer: 5 * 1000, // Renew 5 seconds before expiry (or 50% of lockDuration if smaller)
  maxStalledCount: 1, // Default from BullMQ, though job options might also have this
};

// Helper to calculate when to renew lock
function calculateRenewBuffer(lockDuration: number, configuredBuffer?: number): number {
  if (configuredBuffer !== undefined) {
    return Math.max(1000, Math.min(configuredBuffer, lockDuration - 1000)); // Ensure buffer is positive and less than duration
  }
  return Math.max(1000, lockDuration / 2); // Default to 50% or 1s
}

export class WorkerService<P = unknown, R = unknown> extends EventEmitter {
  public readonly workerId: string;
  private readonly options: Required<WorkerOptions>;
  private isRunning: boolean = false;
  private isClosing: boolean = false;
  private activeJobs: number = 0;
  private jobPromises: Set<Promise<void>> = new Set();
  private lockRenewTimers: Map<string, ReturnType<typeof setTimeout>> = new Map(); // JobId -> Timer
  private pollingInterval: ReturnType<typeof setTimeout> | null = null;
  private readonly pollingIntervalMs = 1000; // How often to check for new jobs if queue is empty or concurrency full

  constructor(
    protected readonly queue: AbstractQueue<P, R>,
    protected readonly processorFn: ProcessorFunction<P, R>,
    opts?: WorkerOptions,
  ) {
    super();
    this.workerId = randomUUID();
    this.options = { ...DEFAULT_WORKER_OPTIONS, ...opts };

    // Adjust lockRenewTimeBuffer based on lockDuration
    this.options.lockRenewTimeBuffer = calculateRenewBuffer(this.options.lockDuration, this.options.lockRenewTimeBuffer);

    if (this.options.concurrency < 1) {
      throw new Error('Concurrency must be at least 1');
    }
  }

  /**
   * Starts the worker. It will begin polling the queue for jobs.
   */
  public async run(): Promise<void> {
    if (this.isRunning) {
      // console.warn(`Worker ${this.workerId} is already running.`);
      return;
    }
    this.isRunning = true;
    this.isClosing = false;
    this.emit('worker.running', { workerId: this.workerId });
    // console.log(`Worker ${this.workerId} started with concurrency ${this.options.concurrency}.`);

    // Initial fill + start polling loop
    this.tryProcessJob();
  }

  private scheduleNextPoll(): void {
    if (this.pollingInterval) {
      clearTimeout(this.pollingInterval);
    }
    if (!this.isRunning || this.isClosing) {
      return;
    }
    this.pollingInterval = setTimeout(() => this.tryProcessJob(), this.pollingIntervalMs);
  }

  /**
   * Attempts to fetch and process a job if concurrency allows and worker is running.
   */
  private async tryProcessJob(): Promise<void> {
    if (!this.isRunning || this.isClosing) {
      this.scheduleNextPoll(); // Still schedule if closing, to allow graceful shutdown to clear existing polls
      return;
    }

    while (this.activeJobs < this.options.concurrency && this.isRunning && !this.isClosing) {
      if (this.activeJobs >= this.options.concurrency) {
        break; // Concurrency limit reached for this iteration
      }

      try {
        const job = await this.queue.fetchNextJobAndLock(this.workerId, this.options.lockDuration);
        if (job) {
          this.activeJobs++;
          this.emit('worker.job.fetched', { workerId: this.workerId, jobId: job.id.value });
          const jobPromise = this.processJob(job).finally(() => {
            this.activeJobs--;
            // After a job finishes, immediately try to pick up another one if capacity allows
            // rather than waiting for the next polling interval.
            if (this.isRunning && !this.isClosing) {
                 this.tryProcessJob();
            }
          });

          this.jobPromises.add(jobPromise);
          jobPromise.then(() => this.jobPromises.delete(jobPromise)).catch(() => this.jobPromises.delete(jobPromise));

        } else {
          // No job found, break loop and wait for next poll
          break;
        }
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        this.emit('worker.error', { workerId: this.workerId, error: `Failed to fetch job: ${errorMessage}`, isCritical: false });
        // console.error(`Worker ${this.workerId} failed to fetch job:`, error);
        // Break loop on fetch error to avoid rapid failing fetches, wait for next poll.
        break;
      }
    }
    // Schedule the next poll regardless of whether jobs were found or concurrency was met,
    // unless we are closing.
    if (this.isRunning && !this.isClosing) {
        this.scheduleNextPoll();
    }
  }

  /**
   * Processes a single job.
   * @param job The job entity to process.
   */
  private async processJob(job: JobEntity<P, R>): Promise<void> {
    this.emit('worker.job.active', { workerId: this.workerId, jobId: job.id.value, name: job.name });
    // console.log(`Worker ${this.workerId} started processing job ${job.id.value} (${job.name})`);

    this.scheduleLockRenewal(job);

    try {
      // Option A: Decorate JobEntity or provide context for updates (Recommended)
      // For simplicity in this initial implementation, we'll use a slightly modified approach:
      // The JobEntity methods `updateProgress` and `addLog` are already designed to store data in memory.
      // We need to ensure these in-memory changes are passed to `markJobAsCompleted/Failed`.
      // The `job` instance passed to `processorFn` will be the one holding these changes.

      const result = await this.processorFn(job);

      // If processorFn resolves, but worker is closing, try to complete anyway but don't take new jobs.
      if (this.isClosing) {
         this.emit('worker.job.closing_complete', { workerId: this.workerId, jobId: job.id.value });
        // console.log(`Worker ${this.workerId} completing job ${job.id.value} during shutdown.`);
      }

      await this.queue.markJobAsCompleted(job.id, this.workerId, result, job); // Pass 'job' which has in-memory changes
      this.emit('worker.job.processed', { workerId: this.workerId, jobId: job.id.value, result });
      // console.log(`Worker ${this.workerId} completed job ${job.id.value}`);

    } catch (error: unknown) {
      const jobError = error instanceof Error ? error : new Error(String(error));
      if (this.isClosing) {
        this.emit('worker.job.closing_fail', { workerId: this.workerId, jobId: job.id.value, error: jobError.message });
        // console.log(`Worker ${this.workerId} failing job ${job.id.value} during shutdown.`);
      }
      await this.queue.markJobAsFailed(job.id, this.workerId, jobError, job); // Pass 'job'
      this.emit('worker.job.errored', { workerId: this.workerId, jobId: job.id.value, error: jobError.message });
      // console.error(`Worker ${this.workerId} failed job ${job.id.value}:`, jobError);
    } finally {
      this.clearLockRenewal(job.id.value);
    }
  }

  /**
   * Schedules automatic lock renewal for an active job.
   * @param job The job entity.
   */
  private scheduleLockRenewal(job: JobEntity<P, R>): void {
    if (this.options.lockDuration <= 0 || this.options.lockRenewTimeBuffer <= 0) {
      return; // Lock renewal is disabled or buffer is invalid
    }

    const renewInterval = this.options.lockDuration - this.options.lockRenewTimeBuffer;
    if (renewInterval <= 0) {
        // console.warn(`Worker ${this.workerId}: Lock renew interval for job ${job.id.value} is too short or negative. Disabling renewal for this job.`);
        return;
    }

    const timer = setTimeout(async () => {
      if (!this.isRunning || this.isClosing || job.status !== JobStatus.ACTIVE) {
        this.clearLockRenewal(job.id.value); // Ensure timer is cleared if job no longer needs renewal
        return;
      }
      try {
        await this.queue.extendJobLock(job.id, this.workerId, this.options.lockDuration);
        this.emit('worker.job.lock_renewed', { workerId: this.workerId, jobId: job.id.value });
        // console.log(`Worker ${this.workerId} renewed lock for job ${job.id.value}`);
        this.scheduleLockRenewal(job); // Schedule next renewal
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        this.emit('worker.error', { workerId: this.workerId, error: `Failed to renew lock for job ${job.id.value}: ${errorMessage}`, jobId: job.id.value, isCritical: false });
        // console.error(`Worker ${this.workerId} failed to renew lock for job ${job.id.value}:`, error);
        // If lock renewal fails, the job might become stalled. The stalled job manager should pick it up.
        // No need to reschedule here, as the lock might be lost.
        this.clearLockRenewal(job.id.value);
      }
    }, renewInterval);

    this.lockRenewTimers.set(job.id.value, timer);
  }

  /**
   * Clears any active lock renewal timer for a job.
   * @param jobId The ID of the job.
   */
  private clearLockRenewal(jobId: string): void {
    const timer = this.lockRenewTimers.get(jobId);
    if (timer) {
      clearTimeout(timer);
      this.lockRenewTimers.delete(jobId);
    }
  }

  /**
   * Stops the worker from picking up new jobs and waits for active jobs to complete.
   * @param timeout Optional timeout in milliseconds to wait for jobs to complete.
   * @returns A promise that resolves when all active jobs have completed or the timeout is reached.
   */
  public async close(timeout?: number): Promise<void> {
    if (this.isClosing) {
      // console.warn(`Worker ${this.workerId} is already closing.`);
      // Potentially return the existing close promise if stored
      return;
    }

    this.isClosing = true;
    this.isRunning = false; // Stop picking new jobs immediately in tryProcessJob checks
    this.emit('worker.closing', { workerId: this.workerId });
    // console.log(`Worker ${this.workerId} closing. Waiting for ${this.activeJobs} active jobs to complete.`);

    if (this.pollingInterval) {
      clearTimeout(this.pollingInterval);
      this.pollingInterval = null;
    }

    // Clear all lock renewal timers
    this.lockRenewTimers.forEach(timer => clearTimeout(timer));
    this.lockRenewTimers.clear();

    const waitForJobs = Promise.all(Array.from(this.jobPromises));

    if (timeout !== undefined && timeout > 0) {
      await Promise.race([
        waitForJobs,
        new Promise(resolve => setTimeout(resolve, timeout))
      ]);
      this.emit('worker.closed_timeout', { workerId: this.workerId, activeJobs: this.activeJobs });
      // console.log(`Worker ${this.workerId} close timeout reached. ${this.activeJobs} jobs might still be running.`);
    } else {
      await waitForJobs;
      this.emit('worker.closed', { workerId: this.workerId });
      // console.log(`Worker ${this.workerId} closed. All active jobs completed.`);
    }
    this.isClosing = false; // Reset for potential restart, though typically worker is discarded
  }
}
