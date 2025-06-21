import { Job, JobId, JobStatus } from '@/core/domain/entities/job'; // Adjust path as needed
import { IRepository } from './repository.interface';

export interface IJobRepository extends IRepository<Job, JobId> {
  // Additional Job-specific methods
  findByStatus(status: JobStatus): Promise<Job[]>;
  findPendingJobs(limit: number): Promise<Job[]>; // Example: for workers to pick up
  // update(job: Job): Promise<void>; // 'save' can often handle create & update
}
