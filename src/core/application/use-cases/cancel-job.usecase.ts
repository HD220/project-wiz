import { Executable } from "../../../shared/executable";
import { Result, ok, error } from "../../../shared/result";
import {
  CancelJobUseCaseInput,
  CancelJobUseCaseOutput,
  CancelJobInputSchema,
} from "./cancel-job.schema";
import { IJobRepository } from "../ports/job-repository.interface"; // Use interface
import { IJobQueue } from "../ports/job-queue.interface"; // Use interface
import { Job } from "../../domain/entities/job/job.entity"; // Import Job entity
import { JobId } from "../../domain/entities/job/value-objects/job-id.vo"; // Already imported in schema, but good for clarity
import { JobTimestamp } from "../../domain/entities/job/value-objects/job-timestamp.vo"; // Import JobTimestamp
import { DomainError } from "../../../core/common/errors"; // Import DomainError

export class CancelJobUseCase
  implements Executable<CancelJobUseCaseInput, Result<CancelJobUseCaseOutput>>
{
  constructor(
    private readonly jobRepository: IJobRepository, // Use interface
    private readonly jobQueue: IJobQueue // Use interface
  ) {}

  async execute(
    input: CancelJobUseCaseInput
  ): Promise<Result<CancelJobUseCaseOutput>> {
    try {
      const validation = CancelJobInputSchema.safeParse(input);
      if (!validation.success) {
        return error(validation.error.flatten().fieldErrors as any); // Use flatten for better error details
      }
      const validInput = validation.data; // validInput.id is JobId VO

      const existingJobResult = await this.jobRepository.load(validInput.id);
      if (existingJobResult.isError()) {
        // Assuming isError means not found or other load error
        return error(new DomainError(`Failed to load job: ${existingJobResult.message}`));
      }
      const existingJob = existingJobResult.value;
      if (!existingJob) {
        return error(new DomainError(`Job with id ${validInput.id.getValue()} not found.`));
      }

      // Use the new cancel method on the Job entity
      // This method should throw DomainError if cancellation is not allowed
      // or handle it by returning a Result itself (for this example, assuming it modifies or throws)
      // The Job.cancel method now handles the logic of checking if it can be cancelled
      // and creating the new state.
      const cancelledJob = existingJob.cancel(JobTimestamp.now());

      await this.jobRepository.save(cancelledJob); // Use save for create/update

      // Optional: Notify jobQueue to remove the job if it's active
      // This depends on whether the queue should actively remove cancelled jobs
      // if (this.jobQueue.removeJob) { // Check if method exists
      //   await this.jobQueue.removeJob(cancelledJob);
      // }

      const props = cancelledJob.getProps();
      return ok({
        id: cancelledJob.id().getValue(), // Use id() and getValue()
        status: props.status.getValue(), // Use getProps() and getValue()
        updatedAt: props.updatedAt!.getValue(), // updatedAt is guaranteed to be set by cancel()
      });
    } catch (err) {
      if (err instanceof DomainError) { // Catch specific domain errors from job.cancel()
        return error(err);
      }
      // Log the actual error for observability
      console.error(`Error during cancel job:`, err);
      return error(new DomainError(err instanceof Error ? err.message : "Failed to cancel job due to an unexpected error."));
    }
  }
}
