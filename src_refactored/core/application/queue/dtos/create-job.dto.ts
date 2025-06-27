import { DomainError, ValueError } from '@/domain/common/errors';
import { JobEntity } from '@/domain/job/job.entity';
import { IJobOptions } from '@/domain/job/value-objects/job-options.vo'; // Assuming IJobOptions is the correct type for opts
import { Result } from '@/shared/result';

// Based on JobEntityConstructionProps from create-job.use-case.ts
export interface CreateJobRequestDTO<TData = any> {
  queueName?: string; // Optional as per BullMQ, but JobEntity might require it. Let's assume optional for DTO.
  jobName?: string;   // Optional as per BullMQ.
  payload: TData;
  opts?: IJobOptions; // From JobEntityConstructionProps
}

// The response is a Result type, which will contain either the JobEntity or an Error.
// The JobEntity itself is generic over TData and TResult.
export type CreateJobResponseDTO<TData = any, TResult = any> = Result<
  JobEntity<TData, TResult>,
  DomainError | ValueError | Error // More specific error types can be added
>;
