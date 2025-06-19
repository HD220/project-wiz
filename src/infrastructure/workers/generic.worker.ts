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
  private processTimeout: NodeJS.Timeout | null = null;

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

    this.logger.info(`Worker ${this.workerId} initialized for queue ${this.queueClient.queueName}. Polling interval: ${this.pollingInterval}ms.`);
  }

  start(): void {
    if (this.isRunning) {
      this.logger.warn(`Worker ${this.workerId} is already running.`);
      return;
    }
    this.isRunning = true;
    this.logger.info(`Worker ${this.workerId} started.`);
    this.poll();
  }

  async stop(): Promise<void> {
    this.isRunning = false;
    if (this.processTimeout) {
      clearTimeout(this.processTimeout);
      this.processTimeout = null;
    }
    this.logger.info(`Worker ${this.workerId} stopping...`);
    // Potentially add logic here to wait for an active job to finish, with a timeout.
    // For now, it just stops polling and new job processing.
  }

  private async poll(): Promise<void> {
    if (!this.isRunning) {
      return;
    }

    try {
      await this.processNextJob();
    } catch (error: any) {
      this.logger.error(`Worker ${this.workerId}: Error during poll/processNextJob: ${error.message}`, error.stack);
    } finally {
      if (this.isRunning) {
        this.processTimeout = setTimeout(() => this.poll(), this.pollingInterval);
      }
    }
  }

  private async processNextJob(): Promise<void> {
    this.logger.debug(`Worker ${this.workerId}: Polling for jobs on queue '${this.queueClient.queueName}'.`);
    const result = await this.queueClient.getNextJob(this.workerId);

    if (!result) {
      this.logger.debug(`Worker ${this.workerId}: No job found in queue '${this.queueClient.queueName}'.`);
      return;
    }

    const { job, lockToken } = result;
    this.logger.info(`Worker ${this.workerId}: Picked up job ${job.id} (name: ${job.name}, attempts: ${job.props.attempts}) from queue '${job.queueName}'. Lock token: ${lockToken.substring(0,8)}...`);

    try {
      job.startProcessing(); // Update job state in memory
      await this.queueClient.saveJobState(job, lockToken); // Persist ACTIVE state
      this.logger.info(`Worker ${this.workerId}: Job ${job.id} marked as ACTIVE.`);

      const processingResult = await this.jobProcessor(job);

      // If jobProcessor completes without throwing a specific error (DelayedError, WaitingChildrenError)
      // it's considered a successful completion.
      job.complete(processingResult);
      this.logger.info(`Worker ${this.workerId}: Job ${job.id} completed successfully. Result: ${JSON.stringify(processingResult)}`);

    } catch (error: any) {
      this.logger.warn(`Worker ${this.workerId}: Error while processing job ${job.id}. Error type: ${error.name}, message: ${error.message}`);

      if (error instanceof DelayedError) {
        // Job was already prepared for delay by job.prepareForDelay() called within jobProcessor
        this.logger.info(`Worker ${this.workerId}: Job ${job.id} signaled for delay. Current delayUntil: ${job.props.delayUntil}`);
        // The job's state (DELAYED, delayUntil) is already set in memory by job.prepareForDelay()
      } else if (error instanceof WaitingChildrenError) {
        // Job was already prepared by job.prepareToWaitForChildren()
        this.logger.info(`Worker ${this.workerId}: Job ${job.id} signaled to wait for children.`);
        // The job's state (WAITING_CHILDREN) is already set in memory
      } else {
        // Generic error from jobProcessor or other issues
        job.fail(error.message || 'Unknown error during job processing');
        this.logger.error(`Worker ${this.workerId}: Job ${job.id} failed. Error: ${error.message}`, error.stack);
      }
    } finally {
      // Always attempt to save the final state of the job
      try {
        await this.queueClient.saveJobState(job, lockToken);
        this.logger.info(`Worker ${this.workerId}: Final state for job ${job.id} (status: ${job.status}) saved.`);
        // The IJobRepository.save implementation is responsible for releasing the lock
        // for terminal states (COMPLETED, FAILED without retries) or re-queued states (DELAYED, PENDING).
      } catch (saveError: any) {
        this.logger.error(`Worker ${this.workerId}: CRITICAL - Failed to save final state for job ${job.id}. Error: ${saveError.message}`, saveError.stack);
        // This is a critical situation. The job might be stuck or processed multiple times.
        // Implement further alerting or recovery logic here if necessary.
      }
    }
  }
}
