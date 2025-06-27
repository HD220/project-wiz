// src_refactored/core/application/use-cases/job/cancel-job.use-case.ts
import { ZodError } from 'zod';

import { ILogger } from '@/core/common/services/i-logger.service'; // Added ILogger
import { IJobQueue } from '@/core/ports/adapters/job-queue.interface';

import { DomainError, NotFoundError, ValueError } from '@/domain/common/errors';
import { IJobRepository } from '@/domain/job/ports/job-repository.interface';
import { JobIdVO } from '@/domain/job/value-objects/job-id.vo';

// import { JobStatusEnum } from '@/domain/job/value-objects/job-status.vo'; // Not directly used, but good for context
import { IUseCase } from '@/application/common/ports/use-case.interface';

import { Result, ok, error } from '@/shared/result';


import {
  CancelJobUseCaseInput,
  CancelJobUseCaseInputSchema,
  CancelJobUseCaseOutput, // Use the corrected type name
} from './cancel-job.schema';

export class CancelJobUseCase
  implements
    IUseCase<
      CancelJobUseCaseInput,
      CancelJobUseCaseOutput, // Use the corrected type name
      DomainError | ZodError | NotFoundError | ValueError
    >
{
  constructor(
    private readonly jobRepository: IJobRepository,
    private readonly jobQueue: IJobQueue,
    private readonly logger: ILogger, // Added logger
  ) {}

  async execute(
    input: CancelJobUseCaseInput,
  ): Promise<Result<CancelJobUseCaseOutput, DomainError | ZodError | NotFoundError | ValueError>> {
    const validationResult = CancelJobUseCaseInputSchema.safeParse(input);
    if (!validationResult.success) {
      return error(validationResult.error);
    }
    const validInput = validationResult.data;

    try {
      const jobIdVo = JobIdVO.fromString(validInput.jobId); // Use JobIdVO

      const jobResult = await this.jobRepository.findById(jobIdVo);
      if (jobResult.isError()) {
        return error(new DomainError(`Failed to fetch job for cancellation: ${jobResult.value.message}`, jobResult.value));
      }
      const jobEntity = jobResult.value;

      if (!jobEntity) {
        return error(new NotFoundError(`Job with ID ${validInput.jobId} not found for cancellation.`));
      }

      const originalStatus = jobEntity.status().value();
      const wasCancelled = jobEntity.moveToCancelled(validInput.reason);

      if (!wasCancelled) {
        return ok({
          success: false,
          jobId: jobEntity.id().value(),
          finalStatus: originalStatus,
          message: `Job ${jobEntity.id().value()} was already in a terminal state (${originalStatus}) or could not be cancelled.`,
        });
      }

      const saveResult = await this.jobRepository.save(jobEntity);
      if (saveResult.isError()) {
        return error(new DomainError(`Failed to save cancelled job status: ${saveResult.value.message}`, saveResult.value));
      }

      // TODO: Interact with IJobQueue if needed (e.g., this.jobQueue.remove(jobIdVo))
      this.logger.info(`Job ${jobIdVo.value} cancelled successfully. Reason: ${validInput.reason || 'No reason provided'}.`);


      return ok({
        success: true,
        jobId: jobEntity.id().value(),
        finalStatus: jobEntity.status().value(),
      });
    } catch (e: unknown) { // Changed err: any to e: unknown
      if (e instanceof ZodError || e instanceof NotFoundError || e instanceof DomainError || e instanceof ValueError) {
        return error(e);
      }
      const message = e instanceof Error ? e.message : String(e);
      this.logger.error(`[CancelJobUseCase] Unexpected error for job ID ${input.jobId}: ${message}`, { error: e });
      return error(new DomainError(`Unexpected error cancelling job: ${message}`));
    }
  }
}
