// src_refactored/core/application/use-cases/job/retry-job.use-case.ts
import { ZodError } from 'zod';

import { Executable } from '@/core/common/executable';
import { IJobQueue } from '@/core/ports/adapters/job-queue.interface';
import { DomainError, NotFoundError, ValueError } from '@/domain/common/errors';
import { Job } from '@/domain/job/job.entity';
import { IJobRepository } from '@/domain/job/ports/job-repository.interface';
import { JobId } from '@/domain/job/value-objects/job-id.vo';
import { JobStatusType } from '@/domain/job/value-objects/job-status.vo';
import { Result, ok, error } from '@/shared/result';

import {
  RetryJobUseCaseInput,
  RetryJobUseCaseInputSchema,
  RetryJobUseCaseOutput,
} from './retry-job.schema';

export class RetryJobUseCase
  implements
    Executable<
      RetryJobUseCaseInput,
      RetryJobUseCaseOutput,
      DomainError | ZodError | NotFoundError | ValueError
    >
{
  constructor(
    private jobRepository: IJobRepository,
    private jobQueue: IJobQueue,
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
      const jobIdVo = JobId.fromString(validInput.jobId);

      const jobResult = await this.jobRepository.findById(jobIdVo);
      if (jobResult.isError()) {
        return error(new DomainError(`Failed to fetch job for retry: ${jobResult.value.message}`, jobResult.value));
      }
      let jobEntity = jobResult.value;

      if (!jobEntity) {
        return error(new NotFoundError(`Job with ID ${validInput.jobId} not found for retry.`));
      }

      // Check if job is in a retryable state (typically FAILED)
      if (!jobEntity.status().is(JobStatusType.FAILED) && !jobEntity.status().is(JobStatusType.ACTIVE) /* allow retry of stuck ACTIVE */) {
        return ok({ // Not an error, but retry wasn't applicable or successful in changing state
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
          newStatus: jobEntity.status().value(), // Status remains FAILED
          executeAfter: jobEntity.executeAfter()?.toISOString() || null,
          message: `Job has reached maximum retry attempts (${jobEntity.maxAttempts().value()}).`,
        });
      }

      // Prepare the job for the next attempt (clears result, resets status via moveToDelayed/Pending)
      // This method now returns a new Job instance.
      const retriedJobEntity = jobEntity.prepareForNextAttempt();

      // Persist the changes
      const saveResult = await this.jobRepository.save(retriedJobEntity);
      if (saveResult.isError()) {
        return error(new DomainError(`Failed to save job state for retry: ${saveResult.value.message}`, saveResult.value));
      }

      // If the job is now PENDING (meaning delay was 0), explicitly add to queue.
      // If it's DELAYED, the queue implementation might pick it up based on executeAfter,
      // but an explicit add/update notification to the queue might be safer depending on queue design.
      // For now, let's re-add to queue if it's processable.
      if (retriedJobEntity.isProcessableNow() || retriedJobEntity.status().is(JobStatusType.DELAYED)) {
        const enqueueResult = await this.jobQueue.add(retriedJobEntity); // `add` should handle existing jobs (idempotency or update)
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

    } catch (err: any) {
      if (err instanceof ZodError || err instanceof NotFoundError || err instanceof DomainError || err instanceof ValueError) {
        return error(err);
      }
      console.error(`[RetryJobUseCase] Unexpected error for job ID ${input.jobId}:`, err);
      return error(new DomainError(`Unexpected error retrying job: ${err.message || err}`));
    }
  }
}
