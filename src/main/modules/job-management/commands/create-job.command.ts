import { JobEntity } from '@/core/domain/job/job.entity';
import { JobRepository } from '../job.repository';
import { JobIdVO } from '@/core/domain/job/value-objects/job-id.vo';
import { IJobOptions } from '@/core/domain/job/value-objects/job-options.vo';

export interface CreateJobCommandPayload<P extends { userId?: string }> {
  id?: string;
  queueName: string;
  name: string;
  payload: P;
  options?: IJobOptions;
}

export class CreateJobCommand<P extends { userId?: string }> {
  constructor(private readonly jobRepository: JobRepository) {}

  async execute(payload: CreateJobCommandPayload<P>): Promise<JobIdVO> {
    const job = JobEntity.create<P, unknown>({
      id: payload.id ? new JobIdVO(payload.id) : undefined,
      queueName: payload.queueName,
      name: payload.name,
      payload: payload.payload,
      options: payload.options,
    });
    await this.jobRepository.create(job);
    return job.id;
  }
}
