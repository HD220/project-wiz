// src/infrastructure/queue/queue.client.ts
import { IQueueClient } from '@/domain/ports/queue/i-queue.client.ts'; // Adjusted path
import { IJobRepository } from '@/domain/repositories/i-job.repository';
import { Job } from '@/domain/entities/job.entity';
import { injectable, inject } from 'inversify'; // QueueClient itself is not typically injected globally
                                             // but its dependencies (like IJobRepository) are.
                                             // However, if QueueClient were to be resolved by DI
                                             // (e.g. using a factory), it might need @injectable.
                                             // For now, assuming it's manually instantiated by AgentLifecycleService.

// @injectable() // Not strictly necessary if QueueClient is new'd up by a service
export class QueueClient implements IQueueClient {
  public readonly queueName: string;
  private jobRepository: IJobRepository;

  constructor(
    queueName: string,
    jobRepository: IJobRepository // This will be injected by the service that creates QueueClient instances
  ) {
    if (!queueName || queueName.trim().length === 0) {
      throw new Error('QueueClient requires a valid queueName.');
    }
    if (!jobRepository) {
      throw new Error('QueueClient requires an IJobRepository instance.');
    }
    this.queueName = queueName;
    this.jobRepository = jobRepository;
  }

  async getNextJob(workerId: string): Promise<{ job: Job; lockToken: string } | null> {
    if (!workerId || workerId.trim().length === 0) {
      throw new Error('QueueClient.getNextJob requires a valid workerId.');
    }
    return this.jobRepository.findNextPending(this.queueName, workerId);
  }

  async saveJobState(job: Job, workerToken: string): Promise<void> {
    if (!job) {
      throw new Error('QueueClient.saveJobState requires a Job instance.');
    }
    if (!workerToken || workerToken.trim().length === 0) {
      // A job that was just added (status PENDING) might not have a lock token yet
      // if saveJobState is called on it before findNextPending.
      // However, the IJobRepository.save contract expects a lockToken for active jobs.
      // This check ensures a token is passed, assuming saveJobState is for jobs being processed.
      // The repository implementation will handle token validation.
      console.warn(`QueueClient.saveJobState called for job ${job.id} without a workerToken. This might be an issue if the job is active.`);
      // Depending on strictness, could throw: throw new Error('QueueClient.saveJobState requires a workerToken.');
    }
    if (job.props.queueName !== this.queueName) {
      // This is a sanity check. A QueueClient for 'queueA' should not save a job belonging to 'queueB'.
      throw new Error(`QueueClient for queue '${this.queueName}' cannot save job '${job.id}' which belongs to queue '${job.props.queueName}'.`);
    }
    return this.jobRepository.save(job, workerToken);
  }
}
