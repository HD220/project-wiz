import { Executable } from "../../../shared/executable";
import { Result, ok, error } from "../../../shared/result";
import {
  CancelJobUseCaseInput,
  CancelJobUseCaseOutput,
  CancelJobInputSchema,
} from "./cancel-job.schema";
import { JobRepository } from "../ports/job-repository.interface";
import { JobQueue } from "../ports/job-queue.interface";
import { JobStatus } from "../../domain/entities/job/value-objects/job-status.vo";
import { JobBuilder } from "../../domain/entities/job/job-builder";

export class CancelJobUseCase
  implements Executable<CancelJobUseCaseInput, Result<CancelJobUseCaseOutput>>
{
  constructor(
    private readonly jobRepository: JobRepository,
    private readonly jobQueue: JobQueue
  ) {}

  async execute(
    input: CancelJobUseCaseInput
  ): Promise<Result<CancelJobUseCaseOutput>> {
    try {
      const validation = CancelJobInputSchema.safeParse(input);
      if (!validation.success) {
        return error(validation.error.message);
      }

      const jobId = input.id;
      const existingJobResult = await this.jobRepository.findById(jobId);
      if (existingJobResult.isError()) {
        return error("Job not found");
      }

      const existingJob = existingJobResult.value;

      // Verificar se o job pode ser cancelado (não está completed/failed/cancelled)
      if (
        ["COMPLETED", "FAILED", "CANCELLED"].includes(existingJob.status.value)
      ) {
        return error("Job cannot be cancelled in current status");
      }

      const builder = new JobBuilder(existingJob);
      builder.withStatus(JobStatus.createCancelled());
      builder.withUpdatedAt(new Date());
      const cancelledJob = builder.build();

      await this.jobRepository.update(cancelledJob);

      return ok({
        id: cancelledJob.id,
        status: cancelledJob.status,
        updatedAt: cancelledJob.updatedAt || new Date(),
      });
    } catch (err) {
      return error(err instanceof Error ? err.message : "Failed to cancel job");
    }
  }
}
