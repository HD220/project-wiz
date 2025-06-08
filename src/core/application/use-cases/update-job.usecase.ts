import { Executable } from "../../../shared/executable";
import { Result, ok, error } from "../../../shared/result";
import {
  UpdateJobUseCaseInput,
  UpdateJobUseCaseOutput,
  UpdateJobInputSchema,
} from "./update-job.schema";
import { JobRepository } from "../ports/job-repository.interface";
import { JobQueue } from "../ports/job-queue.interface";
// Removido import de Job
import { JobId } from "../../domain/entities/job/value-objects/job-id.vo";
import { JobStatus } from "../../domain/entities/job/value-objects/job-status.vo"; // Mantido para JobStatus.create
import { RetryPolicy } from "../../domain/entities/job/value-objects/retry-policy.vo";
import { JobBuilder } from "../../domain/entities/job/job-builder"; // Corrigido o caminho do import

export class UpdateJobUseCase
  implements Executable<UpdateJobUseCaseInput, Result<UpdateJobUseCaseOutput>>
{
  constructor(
    private readonly jobRepository: JobRepository,
    private readonly jobQueue: JobQueue
  ) {}

  async execute(
    input: UpdateJobUseCaseInput
  ): Promise<Result<UpdateJobUseCaseOutput>> {
    try {
      const validation = UpdateJobInputSchema.safeParse(input);
      if (!validation.success) {
        return error(validation.error.message);
      }

      const jobId = new JobId(input.id);
      const existingJobResult = await this.jobRepository.findById(jobId);
      if (existingJobResult.isError()) {
        return error("Job not found");
      }

      const builder = new JobBuilder(existingJobResult.value);

      // Aplicar apenas atualizações permitidas
      if (input.status) {
        builder.withStatus(JobStatus.create(input.status)); // Corrigido para criar instância de JobStatus
      }

      if (input.retryPolicy) {
        builder.withRetryPolicy(
          new RetryPolicy({
            maxAttempts: input.retryPolicy.maxRetries,
            delayBetweenAttempts: input.retryPolicy.delay,
          })
        );
      }

      builder.withUpdatedAt(new Date());
      const updatedJob = builder.build();

      await this.jobRepository.update(updatedJob);

      // Atualizar fila apenas se o status mudou para PENDING
      if (input.status && updatedJob.status.value === "PENDING") {
        await this.jobQueue.addJob(updatedJob);
      }

      return ok({
        id: updatedJob.id.value,
        name: updatedJob.name,
        status: updatedJob.status.value, // Corrigido para acessar o valor do JobStatus
        createdAt: updatedJob.createdAt,
        updatedAt: updatedJob.updatedAt || new Date(),
      });
    } catch (err) {
      return error(err instanceof Error ? err.message : "Failed to update job");
    }
  }
}
