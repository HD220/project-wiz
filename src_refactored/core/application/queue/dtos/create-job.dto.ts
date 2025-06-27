import { DomainError, ValueError } from '@/domain/common/errors';
import { JobEntity } from '@/domain/job/job.entity';
import { IJobOptions } from '@/domain/job/value-objects/job-options.vo';
import { Result } from '@/shared/result';

// Based on JobEntityConstructionProps from create-job.use-case.ts
export interface CreateJobRequestDTO<TData = any> {
  queueName?: string;
  jobName?: string;
  payload: TData;
  opts?: IJobOptions;
}

export type CreateJobResponseDTO<TData = any, TResult = any> = Result<
  JobEntity<TData, TResult>,
  DomainError | ValueError | Error
>;
