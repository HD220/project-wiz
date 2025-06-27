// src_refactored/core/application/queue/dtos/get-job.dto.ts
import { JobEntity } from '@/domain/job/job.entity';

import { Result } from '@/shared/result';


export interface GetJobRequestDTO {
  jobId: string;
}

// Response could be JobEntity | null, or wrapped in a Result object
export type GetJobResponseDTO<TData = unknown, TResult = unknown> = Result<JobEntity<TData, TResult> | null, Error>;
