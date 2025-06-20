// src/infrastructure/queue/queue-client.factory.ts
import { injectable, inject } from 'inversify';
import { IQueueClientFactory } from '@/domain/ports/queue/i-queue-client.factory';
import { IQueueClient } from '@/domain/ports/queue/i-queue.client';
import { QueueClient } from './queue.client'; // The concrete implementation
import { IJobRepository } from '@/domain/repositories/i-job.repository';
import { ILoggerService } from '@/domain/services/i-logger.service';
import { TYPES } from '@/infrastructure/ioc/types';

@injectable()
export class QueueClientFactory implements IQueueClientFactory {
  private jobRepository: IJobRepository;
  private logger: ILoggerService;

  constructor(
    @inject(TYPES.IJobRepository) jobRepository: IJobRepository,
    @inject(TYPES.ILoggerService) logger: ILoggerService
  ) {
    this.jobRepository = jobRepository;
    this.logger = logger;
  }

  getClient(queueName: string): IQueueClient {
    if (!queueName || queueName.trim().length === 0) {
      throw new Error('Queue name must be provided to get a QueueClient.');
    }
    // Each call returns a new QueueClient instance.
    // If QueueClients were expensive to create or meant to be singletons per queueName,
    // this factory could implement caching here. For now, it's a simple new instance.
    return new QueueClient(queueName, this.jobRepository, this.logger);
  }
}
