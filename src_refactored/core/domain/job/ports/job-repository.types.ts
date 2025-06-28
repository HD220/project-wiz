// src_refactored/core/domain/job/ports/job-repository.types.ts
import { JobEntity } from '../job.entity';
import { JobIdVO } from '../value-objects/job-id.vo';
import { JobStatusEnum } from '../value-objects/job-status.vo';

export interface JobSearchFilters {
  queueName?: string;
  jobName?: string;
  status?: JobStatusEnum | JobStatusEnum[];
  parentId?: JobIdVO | string;
  repeatJobKey?: string;
  // Add other filterable fields as needed, e.g., date ranges for createdAt/finishedAt
  createdAtFrom?: Date;
  createdAtTo?: Date;
}

export interface PaginationOptions {
  page?: number; // 1-indexed page number
  limit?: number; // Number of items per page
  sortBy?: string; // Field to sort by (implementation will map to valid column names)
  sortOrder?: 'ASC' | 'DESC';
}

export interface PaginatedJobsResult<TData = unknown, TResult = unknown> { // any to unknown
  jobs: JobEntity<TData, TResult>[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  itemsPerPage: number;
}

// Type for getJobCountsByStatus result
export type JobCountsByStatus = Partial<Record<JobStatusEnum, number>> & {
  waiting?: number; // Alias for PENDING, common in BullMQ
  total?: number;   // Overall total
};
