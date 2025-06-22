// src_refactored/core/domain/job/ports/job-repository.types.ts
import { JobStatusType } from '../value-objects/job-status.vo';
import { TargetAgentRole } from '../value-objects/target-agent-role.vo';
import { Job } from '../job.entity';

export interface JobSearchFilters {
  status?: JobStatusType[];
  targetAgentRole?: TargetAgentRole; // Using VO for type safety
  nameContains?: string;
  // TODO: Consider date range filters for createdAt or updatedAt
  // createdAtFrom?: Date;
  // createdAtTo?: Date;
}

export interface PaginationOptions {
  page: number; // 1-indexed
  pageSize: number;
}

export interface PaginatedJobsResult {
  jobs: Job<any, any>[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
