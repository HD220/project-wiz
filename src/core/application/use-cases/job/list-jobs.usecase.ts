// src/core/application/use-cases/job/list-jobs.usecase.ts
import { Job } from '../../../domain/entities/jobs/job.entity';
import { IJobRepository } from '../../../../core/ports/repositories/job.interface';

export interface IListJobsUseCase {
  execute(queueId: string, limit?: number): Promise<Job<any, any>[]>;
}

export class ListJobsUseCase implements IListJobsUseCase {
  constructor(private jobRepository: IJobRepository) {}

  async execute(queueId: string, limit: number = 20): Promise<Job<any, any>[]> {
    // For TaskTool, we might need more sophisticated filtering/querying later
    // e.g., by status, name, dependencies.
    // For now, using findPending as a placeholder, or a new method in IJobRepository.
    // Let's assume findPending is suitable for now for listing active/pending jobs.
    console.log(`ListJobsUseCase: Listing jobs for queue ${queueId} with limit ${limit}`);
    // This might need a new repository method like `findByQueueId(queueId, status[], limit)`
    // For this example, we'll use findPending. A real implementation might need more.
    return this.jobRepository.findPending(queueId, limit);
  }
}
