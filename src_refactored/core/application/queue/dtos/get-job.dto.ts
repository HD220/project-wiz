// src_refactored/core/application/queue/dtos/get-job.dto.ts
import { Result } from '@/shared/result';
import { JobEntity } from '@/domain/job/job.entity';


export interface GetJobRequestDTO {
  jobId: string;
}

// Response could be JobEntity | null, or wrapped in a Result object
export type GetJobResponseDTO<TData = any, TResult = any> = Result<JobEntity<TData, TResult> | null, Error>;
