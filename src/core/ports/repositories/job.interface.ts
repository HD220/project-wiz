// src/core/ports/repositories/job.interface.ts

import { Job } from '../../domain/entities/jobs/job.entity';

export interface IJobRepository {
  findById(id: string): Promise<Job<any, any> | null>;
  save(job: Job<any, any>): Promise<void>;
  update(job: Job<any, any>): Promise<void>;
  // findPending might need more parameters like priority, specific queue, etc.
  // For now, let's keep it simple as per the plan.
  // It should return jobs that are WAITING or DELAYED (and executeAfter is due).
  findPending(queueId: string, limit: number): Promise<Job<any, any>[]>;
  findPendingByRole(queueId: string, role: string, limit: number): Promise<Job<any, any>[]>;
  delete(jobId: string): Promise<void>;
  // Optional: findByQueueId(queueId: string, status?: JobStatusType, limit?: number, offset?: number): Promise<Job[]>;
}
