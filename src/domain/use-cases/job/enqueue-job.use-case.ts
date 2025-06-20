// src/domain/use-cases/job/enqueue-job.use-case.ts
import { injectable, inject } from 'inversify';
import { TYPES } from '@/infrastructure/ioc/types';
import { IQueueClientFactory } from '@/domain/ports/queue/i-queue-client.factory';
import { Job } from '@/domain/entities/job.entity'; // Remains for EnqueueJobOutput type context

export interface EnqueueJobInput {
  queueName: string;
  jobName: string;
  taskPayload: any; // Renamed from payload to taskPayload for clarity in input DTO
  priority?: number;
  delayUntil?: Date;
  maxAttempts?: number;
  parentId?: string;
  initialJobData?: any; // Renamed from initialData to initialJobData
}

export interface EnqueueJobOutput {
  jobId: string;
  status: string;
  queueName: string;
}

@injectable()
export class EnqueueJobUseCase {
  constructor(
    @inject(TYPES.IQueueClientFactory) private queueClientFactory: IQueueClientFactory
  ) {}

  async execute(input: EnqueueJobInput): Promise<EnqueueJobOutput> {
    if (!input.queueName || input.queueName.trim().length === 0) {
      throw new Error('Queue name must be provided.');
    }
    if (!input.jobName || input.jobName.trim().length === 0) {
      throw new Error('Job name must be provided.');
    }
    if (input.taskPayload === undefined) {
      throw new Error('Task payload must be provided.');
    }

    const queueClient = this.queueClientFactory.getClient(input.queueName);

    // Prepare details for the QueueClient's enqueue method
    // It expects Omit<JobProps, 'id' | 'status' | 'createdAt' | 'updatedAt' | 'attempts' | 'queueName'>
    // which aligns with the parameters Job.create() takes (excluding queueName, which queueClient handles).
    const jobDetailsToEnqueue = {
      name: input.jobName,
      payload: input.taskPayload,
      priority: input.priority,
      delayUntil: input.delayUntil,
      maxAttempts: input.maxAttempts,
      parentId: input.parentId,
      initialData: input.initialJobData,
    };

    const job = await queueClient.enqueue(jobDetailsToEnqueue);

    return {
      jobId: job.id,
      status: job.status,
      queueName: job.props.queueName,
    };
  }
}
