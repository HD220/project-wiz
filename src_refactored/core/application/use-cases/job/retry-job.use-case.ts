// src_refactored/core/application/use-cases/job/retry-job.use-case.ts
import { ZodError } from 'zod';

import { ILogger } from '@/core/common/services/i-logger.service'; // Added ILogger
import { IJobQueue } from '@/core/ports/adapters/job-queue.interface';

import { DomainError, NotFoundError, ValueError } from '@/domain/common/errors';
// import { Job } from '@/domain/job/job.entity'; // Not directly used
import { IJobRepository } from '@/domain/job/ports/job-repository.interface';
import { JobIdVO } from '@/domain/job/value-objects/job-id.vo';
import { JobStatusEnum } from '@/domain/job/value-objects/job-status.vo';

import { IUseCase } from '@/application/common/ports/use-case.interface';

import { Result, ok, error } from '@/shared/result';


import {
  RetryJobUseCaseInput,
  RetryJobUseCaseInputSchema,
  RetryJobUseCaseOutput,
} from './retry-job.schema';

export class RetryJobUseCase
  implements
    IUseCase<
      RetryJobUseCaseInput,
      RetryJobUseCaseOutput,
      DomainError | ZodError | NotFoundError | ValueError
    >
{
  constructor(
    private readonly jobRepository: IJobRepository,
    private readonly jobQueue: IJobQueue,
    private readonly logger: ILogger, // Added logger
  ) {}

  async execute(
    input: RetryJobUseCaseInput,
  ): Promise<Result<RetryJobUseCaseOutput, DomainError | ZodError | NotFoundError | ValueError>> {
    const validationResult = RetryJobUseCaseInputSchema.safeParse(input);
    if (!validationResult.success) {
      return error(validationResult.error);
    }
    const validInput = validationResult.data;

    try {
      const jobIdVo = JobIdVO.fromString(validInput.jobId); // Use JobIdVO

      const jobResult = await this.jobRepository.findById(jobIdVo);
      if (jobResult.isError()) {
        return error(new DomainError(`Failed to fetch job for retry: ${jobResult.value.message}`, jobResult.value));
      }
      const jobEntity = jobResult.value; // jobEntity is now correctly typed Job<unknown, unknown> | null

      if (!jobEntity) {
        return error(new NotFoundError(`Job with ID ${validInput.jobId} not found for retry.`));
      }

      if (!jobEntity.status().is(JobStatusEnum.FAILED) && !jobEntity.status().is(JobStatusEnum.ACTIVE)) { // Use JobStatusEnum
        return ok({
          success: false,
          jobId: jobEntity.id().value(),
          newStatus: jobEntity.status().value(),
          executeAfter: jobEntity.executeAfter()?.toISOString() || null,
          message: `Job is not in a FAILED or ACTIVE state. Current status: ${jobEntity.status().value()}.`,
        });
      }

      if (!jobEntity.canRetry()) {
        return ok({
          success: false,
          jobId: jobEntity.id().value(),
          newStatus: jobEntity.status().value(),
          executeAfter: jobEntity.executeAfter()?.toISOString() || null,
          message: `Job has reached maximum retry attempts (${jobEntity.maxAttempts().value}).`,
        });
      }

      const retriedJobEntity = jobEntity.prepareForNextAttempt();
      const saveResult = await this.jobRepository.save(retriedJobEntity);
      if (saveResult.isError()) {
        return error(new DomainError(`Failed to save job state for retry: ${saveResult.value.message}`, saveResult.value));
      }

      if (retriedJobEntity.isProcessableNow() || retriedJobEntity.status().is(JobStatusEnum.DELAYED)) { // Use JobStatusEnum
        const enqueueResult = await this.jobQueue.add(retriedJobEntity);
        if (enqueueResult.isError()) {
          return error(new DomainError(`Failed to re-enqueue job after preparing for retry: ${enqueueResult.value.message}`, enqueueResult.value));
        }
      }

      return ok({
        success: true,
        jobId: retriedJobEntity.id().value(),
        newStatus: retriedJobEntity.status().value(),
        executeAfter: retriedJobEntity.executeAfter()?.toISOString() || null,
      });
    } catch (e: unknown) { // Changed err: any to e: unknown
      if (e instanceof ZodError || e instanceof NotFoundError || e instanceof DomainError || e instanceof ValueError) {
        return error(e);
      }
      const message = e instanceof Error ? e.message : String(e);
      this.logger.error(`[RetryJobUseCase] Unexpected error for job ID ${input.jobId}: ${message}`, { error: e }); // Added logger
      return error(new DomainError(`Unexpected error retrying job: ${message}`));
    }
  }
}
