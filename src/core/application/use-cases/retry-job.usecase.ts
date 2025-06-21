import { Executable } from "../../../shared/executable";
import { Result, ok, error } from "../../../shared/result";
import {
  RetryJobUseCaseInput,
  RetryJobUseCaseOutput,
  RetryJobInputSchema,
} from "./retry-job.schema";
import { IJobRepository } from "../ports/job-repository.interface";
import { IJobQueue } from "../ports/job-queue.interface"; // Changed from WorkerPool
import { Job } from "../../domain/entities/job/job.entity";
import { JobId } from "../../domain/entities/job/value-objects/job-id.vo"; // Already imported in schema
import { JobTimestamp } from "../../domain/entities/job/value-objects/job-timestamp.vo";
import { DomainError } from "../../../core/common/errors";


export class RetryJobUseCase
  implements Executable<RetryJobUseCaseInput, Result<RetryJobUseCaseOutput>>
{
  constructor(
    private readonly jobRepository: IJobRepository,
    private readonly jobQueue: IJobQueue // Changed from workerPool
  ) {}

  async execute(input: RetryJobUseCaseInput): Promise<Result<RetryJobUseCaseOutput>> {
    const validationResult = RetryJobInputSchema.safeParse(input);
    if (!validationResult.success) {
      return error(validationResult.error.flatten().fieldErrors as any); // Cast for simplicity
    }
    const validInput = validationResult.data; // validInput.jobId is JobId VO

    try {
      const existingJobResult = await this.jobRepository.load(validInput.jobId);
      if (existingJobResult.isError()) {
        return error(new DomainError(`Failed to load job: ${existingJobResult.message}`));
      }
      const jobToRetry = existingJobResult.value;
      if (!jobToRetry) {
        return error(new DomainError(`Job with id ${validInput.jobId.getValue()} not found.`));
      }

      let retryOutcome: { updatedJob: Job; nextRunAt?: Date };
      try {
        // This method now throws DomainError if cannot be retried
        retryOutcome = jobToRetry.recordFailedAttemptAndPrepareForRetry(JobTimestamp.now());
      } catch (domainErr) {
        if (domainErr instanceof DomainError) {
          return error(domainErr); // Propagate DomainError (e.g., "cannot be retried")
        }
        // Re-throw other unexpected errors from within the domain method
        console.error("Unexpected error during job.recordFailedAttemptAndPrepareForRetry:", domainErr);
        throw domainErr;
      }

      const { updatedJob, nextRunAt } = retryOutcome;

      const saveResult = await this.jobRepository.save(updatedJob);
      if (saveResult.isError()) {
         return error(new DomainError(`Failed to save updated job: ${saveResult.message}`));
      }

      if (updatedJob.isPending()) { // Use new entity method
        const enqueueResult = await this.jobQueue.addJob(updatedJob);
        if (enqueueResult.isError()) {
          // Log this error, but the job state is already saved.
          // Depending on requirements, this might be a critical error or just a warning.
          console.warn(`Failed to re-enqueue job ${updatedJob.id().getValue()}: ${enqueueResult.message}`);
          // For now, proceed to return success as job state was updated.
        }
      }

      const finalProps = updatedJob.getProps();
      return ok({
        jobId: updatedJob.id().getValue(),
        attempts: finalProps.attempts.getValue(),
        status: finalProps.status.getValue(),
        nextAttemptAt: nextRunAt,
      });

    } catch (err) {
      console.error("Unexpected error in RetryJobUseCase:", err);
      return error(new DomainError(err instanceof Error ? err.message : "Failed to retry job due to an unexpected error."));
    }
  }

  // calculateNextAttemptDelay method removed as logic is now in Job.entity.ts
}
