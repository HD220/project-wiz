// src/core/domain/services/worker.service.ts

import { IQueueRepository } from '../../ports/repositories/queue.repository';
import { IJobRepository } from '../../ports/repositories/job.repository';
import { IProcessor } from '../../ports/queue/processor.interface';
import { Job } from '../entities/jobs/job.entity';
import { Queue } from '../entities/queue/queue.entity';
import { JobStatusType } from '../entities/jobs/job-status';

export class WorkerService<PInput = any, POutput = any> {
  private queueRepository: IQueueRepository;
  private jobRepository: IJobRepository;
  private processor: IProcessor<PInput, POutput>;
  private isRunning: boolean = false;
  private activeJobs: number = 0;
  private queueConfig: Queue | null = null;
  private pollInterval: NodeJS.Timeout | null = null;
  private readonly pollFrequencyMs: number = 5000; // Check for new jobs every 5 seconds

  constructor(
    queueRepository: IQueueRepository,
    jobRepository: IJobRepository,
    processor: IProcessor<PInput, POutput>,
    options?: { pollFrequencyMs?: number }
  ) {
    this.queueRepository = queueRepository;
    this.jobRepository = jobRepository;
    this.processor = processor;
    if (options?.pollFrequencyMs) {
      this.pollFrequencyMs = options.pollFrequencyMs;
    }
  }

  public async start(queueName: string): Promise<void> {
    if (this.isRunning) {
      console.warn(`WorkerService for queue ${queueName} is already running.`);
      return;
    }

    this.queueConfig = await this.queueRepository.findByName(queueName);
    if (!this.queueConfig) {
      const errMsg = `Queue with name ${queueName} not found. WorkerService cannot start.`;
      console.error(errMsg);
      throw new Error(errMsg);
    }

    this.isRunning = true;
    this.activeJobs = 0;
    console.log(`WorkerService started for queue: ${this.queueConfig.name} (ID: ${this.queueConfig.id}) with concurrency ${this.queueConfig.concurrency}`);

    this.pollInterval = setInterval(() => this.poll(), this.pollFrequencyMs);
    this.poll();
  }

  public stop(): void {
    if (!this.isRunning) {
      console.warn('WorkerService is not running.');
      return;
    }
    this.isRunning = false;
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
    console.log(`WorkerService stopped for queue: ${this.queueConfig?.name}`);
  }

  private async poll(): Promise<void> {
    if (!this.isRunning || !this.queueConfig) {
      if (!this.queueConfig && this.isRunning) {
          console.error("WorkerService polling without queue configuration.");
          this.stop();
      }
      return;
    }

    if (this.activeJobs >= this.queueConfig.concurrency) {
      return;
    }

    try {
      const availableSlots = this.queueConfig.concurrency - this.activeJobs;
      if (availableSlots <= 0) return;

      const pendingJobs = await this.jobRepository.findPending(this.queueConfig.id, availableSlots);

      if (pendingJobs.length === 0) {
        return;
      }

      for (const job of pendingJobs) {
        if (this.activeJobs < this.queueConfig.concurrency) {
          this.activeJobs++;
          // Non-blocking call to processJob
          this.processJob(job).catch(err => {
            console.error(`Unhandled error from processJob promise (ID: ${job.id}):`, err);
          });
        } else {
          break;
        }
      }
    } catch (error) {
      console.error(`Error during polling for queue ${this.queueConfig.name}:`, error);
    }
  }

  private async processJob(job: Job<PInput, POutput>): Promise<void> {
    try {
      console.log(`Processing job ${job.id} from queue ${job.queueId}. Attempt: ${job.attempts + 1}`);

      if (!job.status.is(JobStatusType.WAITING) && !job.status.is(JobStatusType.DELAYED)) {
          console.warn(`Job ${job.id} is not in a processable state (WAITING or DELAYED). Current status: ${job.status.value}. Skipping.`);
          this.activeJobs--; // Decrement as it won't be processed
          return;
      }

      if (!job.moveToActive()) {
        console.warn(`Job ${job.id} could not be moved to ACTIVE state. Current status: ${job.status.value}. This might indicate a race condition or invalid prior state.`);
        this.activeJobs--;
        return;
      }
      await this.jobRepository.update(job);

      try {
        const result = await this.processor.process(job);

        if (result !== undefined) {
          job.moveToCompleted(result as POutput);
          console.log(`Job ${job.id} completed successfully.`);
        } else {
          job.moveToDelayed(0);
          console.log(`Job ${job.id} requires continuation, moved to DELAYED for re-polling.`);
        }
      } catch (error: any) {
        console.error(`Error processing job ${job.id}:`, error.message);
        if (job.attempts < job.maxAttempts) {
          const nextRetryDelay = job.calculateNextRetryDelay(); // Use default base delay from Job entity
          job.moveToDelayed(nextRetryDelay);
          console.log(`Job ${job.id} failed. Will retry in ${nextRetryDelay}ms. Attempt ${job.attempts}/${job.maxAttempts}.`);
        } else {
          job.moveToFailed(error.message || 'Max attempts reached');
          console.log(`Job ${job.id} failed after ${job.maxAttempts} attempts.`);
        }
      }
      await this.jobRepository.update(job);

    } catch (outerError) {
      console.error(`Critical error in processJob for job ${job.id}:`, outerError);
      try {
        // Attempt to fetch the latest state and mark as FAILED if it was left ACTIVE
        const currentJobState = await this.jobRepository.findById(job.id);
        if (currentJobState && currentJobState.status.is(JobStatusType.ACTIVE)) {
            currentJobState.moveToFailed('Critical processing error');
            await this.jobRepository.update(currentJobState);
            console.error(`Job ${job.id} marked as FAILED due to critical error during processing loop.`);
        }
      } catch (rescueError) {
          console.error(`Failed to update job ${job.id} to FAILED after critical error:`, rescueError);
      }
    } finally {
      this.activeJobs--;
    }
  }
}
