import { Executable } from "../../../shared/executable";
import { Result, ok, error } from "../../../shared/result";
import {
  CreateJobUseCaseInput,
  CreateJobUseCaseOutput,
  CreateJobInputSchema,
} from "./create-job.schema";
import { JobRepository } from "../ports/job-repository.interface";
import { JobQueue } from "../ports/job-queue.interface";
import { JobBuilder } from "../../domain/entities/job/job-builder"; // Corrigido o caminho do import
import { JobId } from "../../domain/entities/job/value-objects/job-id.vo";
import { JobStatus } from "../../domain/entities/job/value-objects/job-status.vo";
import { RetryPolicy } from "../../domain/entities/job/value-objects/retry-policy.vo";

export class CreateJobUseCase
  implements Executable<CreateJobUseCaseInput, Result<CreateJobUseCaseOutput>>
{
  constructor(
    private readonly jobRepository: JobRepository,
    private readonly jobQueue: JobQueue
  ) {}

  async execute(
    input: CreateJobUseCaseInput
  ): Promise<Result<CreateJobUseCaseOutput>> {
    try {
      const validation = CreateJobInputSchema.safeParse(input);
      if (!validation.success) {
        return error(validation.error.message);
      }

      const jobId = new JobId(Date.now().toString());
      const jobStatus = JobStatus.createInitial(); // Corrigido para usar o método estático

      const retryPolicyInput = input.retryPolicy
        ? {
            maxAttempts: input.retryPolicy.maxRetries,
            delayBetweenAttempts: input.retryPolicy.delay,
          }
        : undefined;

      const retryPolicy = new RetryPolicy(retryPolicyInput);

      const job = new JobBuilder()
        .withId(jobId)
        .withName(input.name)
        .withStatus(jobStatus)
        .withCreatedAt(new Date())
        .withPayload(input.payload ?? {})
        .withRetryPolicy(retryPolicy)
        .build();

      await this.jobRepository.create(job);
      await this.jobQueue.addJob(job);

      return ok({
        id: job.id.value,
        name: job.name,
        status: job.status.value, // Corrigido para acessar o valor do JobStatus
        createdAt: job.createdAt,
      });
    } catch (err) {
      return error(err instanceof Error ? err.message : "Failed to create job");
    }
  }
}
