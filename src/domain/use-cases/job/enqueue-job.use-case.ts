// src/domain/use-cases/job/enqueue-job.use-case.ts
import { injectable, inject } from 'inversify';
import { TYPES } from '@/infrastructure/ioc/types';
import { IJobRepository } from '@/domain/repositories/i-job.repository';
import { Job } from '@/domain/entities/job.entity'; // Adjusted path

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
    @inject(TYPES.IJobRepository) private jobRepository: IJobRepository
  ) {}

  async execute(input: EnqueueJobInput): Promise<EnqueueJobOutput> {
    if (!input.queueName || input.queueName.trim().length === 0) {
      throw new Error('Queue name must be provided.');
    }
    if (!input.jobName || input.jobName.trim().length === 0) {
      throw new Error('Job name must be provided.');
    }
    // In a real scenario, taskPayload might have stricter validation based on jobName
    if (input.taskPayload === undefined) {
      throw new Error('Task payload must be provided.');
    }

    const job = Job.create({
      name: input.jobName,
      queueName: input.queueName,
      payload: input.taskPayload, // Maps taskPayload from input to payload in Job entity
      priority: input.priority,
      delayUntil: input.delayUntil,
      maxAttempts: input.maxAttempts,
      parentId: input.parentId,
      initialData: input.initialJobData, // Maps initialJobData from input to initialData in Job entity
    });

    await this.jobRepository.add(job);

    return {
      jobId: job.id,
      status: job.status, // Accesses the getter on the Job instance
      queueName: job.props.queueName,
    };
  }
}
