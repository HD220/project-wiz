// src/infrastructure/workers/generic.worker.ts
import { IQueueClient } from '@/domain/ports/queue/i-queue.client.ts';
import { Job } from '@/domain/entities/job.entity';
import { ILoggerService } from '@/domain/services/i-logger.service'; // Assuming logger interface
import { randomUUID } from 'crypto';

// Placeholder custom errors - these might be defined in a shared error module later
export class DelayedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DelayedError';
  }
}

export class WaitingChildrenError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'WaitingChildrenError';
  }
}

export type JobProcessor = (job: Job) => Promise<any>;

export class GenericWorker {
  public readonly workerId: string;
  private queueClient: IQueueClient;
  private jobProcessor: JobProcessor;
  private logger: ILoggerService;
  private isRunning: boolean = false;
  private pollingInterval: number;
  // private processTimeout: NodeJS.Timeout | null = null; // Removed

  constructor(
    workerId: string | null, // Allow null for auto-generation
    queueClient: IQueueClient,
    jobProcessor: JobProcessor,
    logger: ILoggerService,
    pollingIntervalMs: number = 5000 // Default polling interval: 5 seconds
  ) {
    this.workerId = workerId || `worker-${randomUUID()}`;
    if (!queueClient) throw new Error('GenericWorker requires an IQueueClient instance.');
    if (!jobProcessor) throw new Error('GenericWorker requires a jobProcessor function.');
    if (!logger) throw new Error('GenericWorker requires an ILoggerService instance.');

    this.queueClient = queueClient;
    this.jobProcessor = jobProcessor;
    this.logger = logger;
    this.pollingInterval = pollingIntervalMs;

    this.logger.info(`[GenericWorker:${this.workerId}] Initialized for queue ${this.queueClient.queueName}. Polling interval: ${this.pollingInterval}ms.`);
  }

  start(): void {
    if (this.isRunning) {
      this.logger.warn(`[GenericWorker:${this.workerId}] is already running.`);
      return;
    }
    this.isRunning = true;
    this.logger.info(`[GenericWorker:${this.workerId}] started.`);
    this.runLoop().catch(err => {
      this.logger.error(`[GenericWorker:${this.workerId}] Critical error in runLoop: ${err.message}`, err.stack);
      // TODO: Handle critical loop failure, maybe try to restart or log prominently
    });
  }

  async stop(): Promise<void> {
    this.isRunning = false;
    // Removed clearTimeout logic for processTimeout
    this.logger.info(`[GenericWorker:${this.workerId}] stopping...`);
    // Potentially add logic here to wait for an active job to finish, with a timeout.
  }

  private async runLoop(): Promise<void> {
    this.logger.info(`[GenericWorker:${this.workerId}] Run loop started.`);
    while (this.isRunning) {
      try {
        const jobFoundAndAttempted = await this.processNextJob();
        if (!jobFoundAndAttempted) {
          // No job was found, wait before trying again
          if (this.isRunning) { // Check isRunning again before sleep
            this.logger.debug(`[GenericWorker:${this.workerId}] No job processed, sleeping for ${this.pollingInterval}ms.`);
            await new Promise(resolve => setTimeout(resolve, this.pollingInterval));
          }
        }
        // If a job was found and attempted, loop immediately to check for the next one.
      } catch (error: any) {
        // This catch is for unexpected errors within processNextJob itself if it doesn't handle them internally
        // or errors in the delay mechanism.
        this.logger.error(`[GenericWorker:${this.workerId}] Error in runLoop's iteration: ${error.message}`, error.stack);
        // Avoid fast error loops if the error is persistent
        if (this.isRunning) {
          await new Promise(resolve => setTimeout(resolve, this.pollingInterval));
        }
      }
    }
    this.logger.info(`[GenericWorker:${this.workerId}] Run loop stopped.`);
  }

  private async processNextJob(): Promise<boolean> { // Return boolean: true if job found and processed, false otherwise
    this.logger.debug(`[GenericWorker:${this.workerId}] Checking for jobs on queue '${this.queueClient.queueName}'.`);
    const result = await this.queueClient.getNextJob(this.workerId);

    if (!result) {
      this.logger.debug(`[GenericWorker:${this.workerId}] No job found in queue '${this.queueClient.queueName}'.`);
      return false; // No job found
    }

    const { job, lockToken } = result;
    this.logger.info(`[GenericWorker:${this.workerId}] Picked up job ${job.id} (name: ${job.name}, attempts: ${job.props.attempts}) from queue '${job.queueName}'. Lock token: ${lockToken.substring(0,8)}...`);

    try {
      job.startProcessing(); // Update job state in memory
      await this.queueClient.saveJobState(job, lockToken); // Persist ACTIVE state
      this.logger.info(`[GenericWorker:${this.workerId}] Job ${job.id} marked as ACTIVE.`);

      const processingResult = await this.jobProcessor(job);

      job.complete(processingResult);
      this.logger.info(`[GenericWorker:${this.workerId}] Job ${job.id} completed successfully. Result: ${JSON.stringify(processingResult)}`);

    } catch (error: any) {
      this.logger.warn(`[GenericWorker:${this.workerId}] Error while processing job ${job.id}. Error type: ${error.name}, message: ${error.message}`);

      if (error instanceof DelayedError) {
        this.logger.info(`[GenericWorker:${this.workerId}] Job ${job.id} signaled for delay. Current delayUntil: ${job.props.delayUntil}`);
      } else if (error instanceof WaitingChildrenError) {
        this.logger.info(`[GenericWorker:${this.workerId}] Job ${job.id} signaled to wait for children.`);
      } else {
        job.fail(error.message || 'Unknown error during job processing');
        this.logger.error(`[GenericWorker:${this.workerId}] Job ${job.id} failed. Error: ${error.message}`, error.stack);
      }
    } finally {
      // Always attempt to save the final state of the job
      try {
        await this.queueClient.saveJobState(job, lockToken);
        this.logger.info(`[GenericWorker:${this.workerId}] Final state for job ${job.id} (status: ${job.status}) saved.`);
      } catch (saveError: any) {
        this.logger.error(`[GenericWorker:${this.workerId}] CRITICAL - Failed to save final state for job ${job.id}. Error: ${saveError.message}`, saveError.stack);
      }
    }
    return true; // A job was found and processing was attempted
  }
}
