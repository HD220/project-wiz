// src_refactored/core/application/use-cases/job/cancel-job.use-case.ts
import { ZodError } from 'zod';
import { Executable } from '../../../common/executable';
import {
  CancelJobUseCaseInput,
  CancelJobUseCaseInputSchema,
  CancelJobUseCaseOutputSchema, // Corrected type name
} from './cancel-job.schema';
import { IJobRepository } from '../../../../domain/job/ports/job-repository.interface';
import { IJobQueue } from '../../../../core/ports/adapters/job-queue.interface'; // For potential queue interaction
import { JobId } from '../../../../domain/job/value-objects/job-id.vo';
import { JobStatusType } from '../../../../domain/job/value-objects/job-status.vo';
import { Result, ok, error } from '../../../../../shared/result';
import { DomainError, NotFoundError, ValueError } from '../../../../common/errors';

export class CancelJobUseCase
  implements
    Executable<
      CancelJobUseCaseInput,
      CancelJobUseCaseOutputSchema, // Use the OutputSchema type from Zod
      DomainError | ZodError | NotFoundError | ValueError
    >
{
  constructor(
    private jobRepository: IJobRepository,
    private jobQueue: IJobQueue, // Injected, though not used in this simplified version
  ) {}

  async execute(
    input: CancelJobUseCaseInput,
  ): Promise<Result<CancelJobUseCaseOutputSchema, DomainError | ZodError | NotFoundError | ValueError>> {
    const validationResult = CancelJobUseCaseInputSchema.safeParse(input);
    if (!validationResult.success) {
      return error(validationResult.error);
    }
    const validInput = validationResult.data;

    try {
      const jobIdVo = JobId.fromString(validInput.jobId);

      const jobResult = await this.jobRepository.findById(jobIdVo);
      if (jobResult.isError()) {
        return error(new DomainError(`Failed to fetch job for cancellation: ${jobResult.value.message}`, jobResult.value));
      }
      const jobEntity = jobResult.value;

      if (!jobEntity) {
        return error(new NotFoundError(`Job with ID ${validInput.jobId} not found for cancellation.`));
      }

      const originalStatus = jobEntity.status().value();

      // Check if job can be cancelled (e.g., not already in a terminal state like COMPLETED or FAILED permanently)
      // The moveToCancelled method in entity now checks isTerminal()
      const wasCancelled = jobEntity.moveToCancelled(validInput.reason);

      if (!wasCancelled) {
        // Job was already in a terminal state or already cancelled
        return ok({
          success: false, // Or true, depending on idempotency definition. Let's say false if no state change.
          jobId: jobEntity.id().value(),
          finalStatus: originalStatus, // No change in status
          message: `Job ${jobEntity.id().value()} was already in a terminal state (${originalStatus}) or could not be cancelled.`,
        });
      }

      // Persist the change
      const saveResult = await this.jobRepository.save(jobEntity);
      if (saveResult.isError()) {
        // Potentially revert status change in memory if save fails? Or rely on transactional outbox for queue.
        // For now, simple error propagation.
        return error(new DomainError(`Failed to save cancelled job status: ${saveResult.value.message}`, saveResult.value));
      }

      // TODO: Future - Interact with IJobQueue if needed
      // e.g., this.jobQueue.remove(jobIdVo) or similar to pull from an active processing queue.
      // For now, assumes queue implementation polls DB status or is handled by other mechanisms.

      return ok({
        success: true,
        jobId: jobEntity.id().value(),
        finalStatus: jobEntity.status().value(), // Should be CANCELLED
      });

    } catch (err: any) {
      if (err instanceof ZodError || err instanceof NotFoundError || err instanceof DomainError || err instanceof ValueError) {
        return error(err);
      }
      console.error(`[CancelJobUseCase] Unexpected error for job ID ${input.jobId}:`, err);
      return error(new DomainError(`Unexpected error cancelling job: ${err.message || err}`));
    }
  }
}
