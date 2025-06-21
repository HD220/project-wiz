// src/infrastructure/queue/queue.client.ts
import { IQueueClient } from '@/domain/ports/queue/i-queue.client.ts';
import { IJobRepository } from '@/domain/repositories/i-job.repository';
import { Job, JobProps } from '@/domain/entities/job.entity'; // Make sure JobProps is exported from job.entity.ts
import { ILoggerService } from '@/domain/services/i-logger.service';
import { TYPES } from '@/infrastructure/ioc/types'; // For logger type (though not used for @inject here)

// @injectable() // Still not strictly necessary if new'd up by factory/service
export class QueueClient implements IQueueClient {
  public readonly queueName: string;
  private jobRepository: IJobRepository;
  private logger: ILoggerService; // Added logger

  constructor(
    queueName: string,
    jobRepository: IJobRepository,
    logger: ILoggerService // Added logger parameter
  ) {
    if (!queueName || queueName.trim().length === 0) {
      // No logger available yet if this fails
      throw new Error('QueueClient requires a valid queueName.');
    }
    if (!jobRepository) {
      throw new Error('QueueClient requires an IJobRepository instance.');
    }
    if (!logger) {
      throw new Error('QueueClient requires an ILoggerService instance.');
    }
    this.queueName = queueName;
    this.jobRepository = jobRepository;
    this.logger = logger;
    this.logger.info(`[QueueClient:${this.queueName}] Initialized.`);
  }

  async getNextJob(workerId: string): Promise<{ job: Job; lockToken: string } | null> {
    if (!workerId || workerId.trim().length === 0) {
      this.logger.error(`[QueueClient:${this.queueName}] getNextJob called without workerId.`);
      throw new Error('QueueClient.getNextJob requires a valid workerId.');
    }
    this.logger.debug(`[QueueClient:${this.queueName}] Attempting to get next job for worker ${workerId}`);
    const result = await this.jobRepository.findNextPending(this.queueName, workerId);
    if (result) {
        this.logger.info(`[QueueClient:${this.queueName}] Job ${result.job.id} found for worker ${workerId}`);
    } else {
        this.logger.debug(`[QueueClient:${this.queueName}] No job found for worker ${workerId}`);
    }
    return result;
  }

  async saveJobState(job: Job, workerToken: string): Promise<void> {
    if (!job) {
      this.logger.error(`[QueueClient:${this.queueName}] saveJobState called without a job.`);
      throw new Error('QueueClient.saveJobState requires a Job instance.');
    }
    // Relaxed workerToken check slightly, as repository should validate it fully
    // The IJobRepository.save contract expects a lockToken for active jobs.
    if (!workerToken && job.status === 'ACTIVE') { // Be more specific about when token is critical
      this.logger.warn(`[QueueClient:${this.queueName}] saveJobState called for ACTIVE job ${job.id} without a workerToken.`);
      // Depending on strictness, could throw: throw new Error('QueueClient.saveJobState requires a workerToken for active jobs.');
    }
    if (job.props.queueName !== this.queueName) {
      this.logger.error(`[QueueClient:${this.queueName}] Attempted to save job ${job.id} which belongs to queue ${job.props.queueName}.`);
      throw new Error(`QueueClient for queue '${this.queueName}' cannot save job '${job.id}' which belongs to queue '${job.props.queueName}'.`);
    }
    this.logger.debug(`[QueueClient:${this.queueName}] Attempting to save state for job ${job.id} with status ${job.status}`);
    await this.jobRepository.save(job, workerToken);
    this.logger.info(`[QueueClient:${this.queueName}] Successfully saved state for job ${job.id}`);
  }

  async enqueue(jobDetails: Omit<JobProps, 'id' | 'status' | 'createdAt' | 'updatedAt' | 'attempts' | 'queueName'>): Promise<Job> {
    // jobRepository check is good, but constructor should prevent this state.
    // if (!this.jobRepository) {
    //   this.logger.error(`[QueueClient:${this.queueName}] JobRepository is not initialized.`);
    //   throw new Error('JobRepository is not initialized in QueueClient.');
    // }

    const job = Job.create({
      ...jobDetails,
      queueName: this.queueName, // Implicitly use the client's queueName
    });

    await this.jobRepository.add(job);
    this.logger.info(`[QueueClient:${this.queueName}] Enqueued job ${job.id} (Name: ${job.name})`);
    return job;
  }
}
