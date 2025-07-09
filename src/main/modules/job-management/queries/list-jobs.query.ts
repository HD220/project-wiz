import { JobEntity } from '@/core/domain/job/job.entity';
import { JobRepository } from '../job.repository';

export class ListJobsQuery {
  constructor(private readonly jobRepository: JobRepository) {}

  async execute(): Promise<JobEntity<any, any>[]> {
    return this.jobRepository.listAll();
  }
}
