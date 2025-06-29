// src_refactored/core/application/worker/worker.service.ts
import { randomUUID } from 'node:crypto';
import EventEmitter from 'node:events';
import { Timeout } from 'node:timers'; // Added import

import { AbstractQueue } from '@/core/application/queue/abstract-queue';
import { JobEntity } from '@/core/domain/job/job.entity';

import { ProcessorFunction, WorkerOptions } from './worker.types';

export class WorkerService<P, R> extends EventEmitter {
  public readonly workerId: string;
  private _isRunning: boolean = false;
  private _isClosed: boolean = false;
  private _activeJobs: number = 0; // Still useful for graceful close
  private lockRenewTimers: Map<string, Timeout> = new Map();
  private pollLoopPromise: Promise<void> | null = null;
  private readonly pollingIntervalMs: number = 1000; // Configurable polling interval

  constructor(
    protected readonly queue: AbstractQueue<P, R>,
    protected readonly processor: ProcessorFunction<P, R>,
    protected readonly opts: WorkerOptions = { lockDuration: 30000 }, // Concurrency option is now managed internally to 1
  ) {
    super();
    this.workerId = randomUUID();
    // Concurrency is effectively 1 due to sequential processing logic in poll()
    // this.opts.concurrency = 1; // Explicitly set or just rely on logic
    if (opts.concurrency && opts.concurrency > 1) {
        console.warn(`[WorkerService] Concurrency option > 1 is not supported in this sequential version. Effective concurrency is 1.`);
    }
  }

  get isRunning(): boolean { return this._isRunning; }
  get isClosed(): boolean { return this._isClosed; }
  get activeJobCount(): number { return this._activeJobs; } // Indicates if a job is currently processing

  public run(): void {
    if (this._isRunning || this._isClosed) return;
    this._isRunning = true;
    this.pollLoopPromise = this.poll(); // Start the polling loop
  }

  public async close(): Promise<void> {
    if (this._isClosed) return;

    this._isRunning = false; // Signal the poll loop to stop
    this._isClosed = true;   // Mark as closed to prevent new operations

    // Wait for the current polling loop iteration to finish if it's running
    if (this.pollLoopPromise) {
        try {
            await this.pollLoopPromise;
        } catch (error) {
            // In case the poll loop itself had an unhandled rejection during shutdown
            this.emit('worker.error', new Error(`Error during poll loop shutdown: ${error instanceof Error ? error.message : String(error)}`));
        }
    }

    // Wait for any active job to finish (activeJobs should be 0 or 1)
    const gracefulShutdownTimeout = this.opts.lockDuration ? this.opts.lockDuration * 2 : 60000; // Max wait time
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
      if (this._activeJobs !== 0) { // Se um job já estiver ativo (salvaguarda, ou aguardando ciclo anterior)
        await new Promise(resolve => setTimeout(resolve, this.pollingIntervalMs));
        continue; // Pula para a próxima iteração do while
      }

      try {
        const job = await this.queue.fetchNextJobAndLock(this.workerId, this.opts.lockDuration ?? 30000);

        if (!job) { // Se nenhum job foi encontrado
          await new Promise(resolve => setTimeout(resolve, this.pollingIntervalMs));
          continue; // Pula para a próxima iteração do while
        }

        // Job encontrado, verificar status do worker antes de processar
        if (!this._isRunning || this._isClosed) {
          console.warn(`[WorkerService] Worker stopped while job ${job.id.value} was fetched. Job may become stalled.`);
          // Idealmente, tentar devolver o job para a fila ou liberar o lock.
          // Por agora, o job pode se tornar 'stalled' e ser pego pela manutenção.
          break; // Sai do loop de polling
        }

        this._activeJobs = 1; // Marca um job como ativo
        await this.processJob(job); // Aguarda o processamento para execução sequencial
        // O bloco finally de processJob definirá _activeJobs = 0

      } catch (error) {
        this.emit('worker.error', error); // Erro ao buscar ou durante processJob (se não capturado pelo try/catch de processJob)
        // Espera antes de tentar o poll novamente para evitar loops rápidos de erro
        await new Promise(resolve => setTimeout(resolve, this.pollingIntervalMs * 2));
      }
    }
  }

  private async processJob(job: JobEntity<P, R>): Promise<void> {
    // Bind job entity's updateProgress and addLog to the queue methods
    // This ensures that when the processor calls job.updateProgress or job.addLog,
    // it directly communicates with the queue service.
    const originalUpdateProgress = job.updateProgress.bind(job);
    job.updateProgress = (progress: number | object) => {
      originalUpdateProgress(progress);
      // Not awaiting these queue calls to prevent blocking the processor,
      // but they should handle errors internally or be fire-and-forget.
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
      const result = await this.processor(job); // User's processing logic

      // If worker was closed while processor was running, but before completion call to queue
      if (this._isClosed && !job.finishedOn) {
         this.emit('worker.job.interrupted', job);
         // Rely on lock expiration and stalled job handling by the queue.
      } else if (!this._isClosed) { // Only attempt to mark as completed if not closing
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
      // This is critical: ensure activeJobs is decremented even if processor throws unhandled error
      // or if queue operations (markJobAsCompleted/Failed) throw errors not caught above.
      this._activeJobs = 0; // Set to 0 as only one job is processed at a time.
      this.clearLockRenewal(job.id.value);
      // Restore original methods on job entity to prevent issues if the entity instance is reused (though typically not)
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