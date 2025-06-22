// src_refactored/core/domain/job/ports/job-repository.interface.ts
import { Result } from '../../../../shared/result';
import { Job } from '../job.entity';
import { JobId } from '../value-objects/job-id.vo';
import { JobStatus } from '../value-objects/job-status.vo';
import { TargetAgentRole } from '../value-objects/target-agent-role.vo';

export interface IJobRepository {
  save(job: Job<any, any>): Promise<Result<void>>; // Handles both create and update
  findById(id: JobId): Promise<Result<Job<any, any> | null>>;
  // findAllByStatus(status: JobStatus): Promise<Result<Job<any, any>[]>>; // Might be too broad
  // findAllByTargetRole(role: TargetAgentRole): Promise<Result<Job<any, any>[]>>;

  // Method to get the next job(s) to be processed.
  // This is critical for the worker/queue system.
  // It needs to consider status (PENDING, or DELAYED with executeAfter in past),
  // priority, creation time, and potentially dependencies.
  // The `limit` is for how many jobs a worker might try to fetch.
  findProcessableJobs(
    targetRole: TargetAgentRole,
    limit: number
  ): Promise<Result<Job<any, any>[]>>;

  // Simpler version if role filtering happens higher up or is not needed at repo level for getNext
  // findNextProcessableJob(): Promise<Result<Job<any, any> | null>>;


  // Optional: if specific update patterns are common and need optimization
  // updateStatus(id: JobId, status: JobStatus): Promise<Result<void>>;
  // updateData(id: JobId, data: any): Promise<Result<void>>; // For AgentJobState

  delete(id: JobId): Promise<Result<void>>;
  findAll(): Promise<Result<Job<any,any>[]>>; // For admin/debug purposes
}
