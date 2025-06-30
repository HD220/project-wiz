// src_refactored/core/application/worker/worker.service.ts
import { randomUUID } from 'node:crypto';
import EventEmitter from 'node:events';

import { AbstractQueue } from '@/core/application/queue/abstract-queue';
import { JobEntity } from '@/core/domain/job/job.entity';

import { ProcessorFunction, WorkerOptions } from './worker.types';

export class WorkerService<P, R> extends EventEmitter {
  private readonly workerId: string;
  private running: boolean = false;
  private activeJobs: number = 0;
  private lockRenewTimers: Map<string, NodeJS.Timeout> = new Map();

  constructor(
    protected readonly queue: AbstractQueue<P, R>,
    protected readonly processor: ProcessorFunction<P, R>,
    protected readonly opts: WorkerOptions = { concurrency: 1, lockDuration: 30000 },
  ) {
    super();
    this.workerId = randomUUID();
  }

  public run(): void {
    if (this.running) return;
    this.running = true;
    this.poll();
  }

  public async close(): Promise<void> {
    this.running = false;
    // Wait for active jobs to finish
    while (this.activeJobs > 0) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    this.lockRenewTimers.forEach(timer => clearInterval(timer));
  }

  private async poll(): Promise<void> {
    if (!this.running) return;

    if (this.activeJobs < this.opts.concurrency) {
      const job = await this.queue.fetchNextJobAndLock(this.workerId, this.opts.lockDuration);
      if (job) {
        this.activeJobs++;
        this.processJob(job);
      }
    }

    setTimeout(() => this.poll(), 1000); // Poll every second
  }

  private async processJob(job: JobEntity<P, R>): Promise<void> {
    this.emit('worker.job.active', job);
    this.setupLockRenewal(job);

    try {
      const result = await this.processor(job);
      await this.queue.markJobAsCompleted(job.id, this.workerId, result, job);
      this.emit('worker.job.processed', job);
    } catch (error) {
      await this.queue.markJobAsFailed(job.id, this.workerId, error as Error, job);
      this.emit('worker.job.errored', job, error);
    } finally {
      this.activeJobs--;
      this.clearLockRenewal(job.id.value);
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