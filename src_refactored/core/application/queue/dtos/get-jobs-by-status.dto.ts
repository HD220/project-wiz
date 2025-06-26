// src_refactored/core/application/queue/dtos/get-jobs-by-status.dto.ts
import { JobEntity } from '../../../domain/job/job.entity';
import { Result } from '../../../../shared/result';
import { JobStatusEnum } from '../../../domain/job/value-objects/job-status.vo';
import { PaginationOptions, PaginatedJobsResult } from '../../../domain/job/ports/job-repository.types';

export interface GetJobsByStatusRequestDTO {
  queueName: string;
  statuses: JobStatusEnum[];
  paginationOptions?: PaginationOptions; // Optional pagination
}

// The response will be a list of jobs, potentially paginated.
// The IJobRepository.search method returns PaginatedJobsResult.
export type GetJobsByStatusResponseDTO<TData = any, TResult = any> = Result<PaginatedJobsResult<TData, TResult>, Error>;
