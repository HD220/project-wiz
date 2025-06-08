import { Executable } from "../../../shared/executable";
import { JobId } from "../../domain/entities/job/value-objects/job-id.vo";
import { Job } from "../../domain/entities/job/job.entity";
import { RetryPolicy } from "../../domain/entities/job/value-objects/retry-policy.vo";
import { JobStatus } from "../../domain/entities/job/value-objects/job-status.vo";

export interface JobRepository {
  findById(id: JobId): Promise<Job | null>;
  update(job: Job): Promise<void>;
}

export interface WorkerPool {
  enqueue(job: Job): Promise<void>;
}

export type RetryJobUseCaseInput = {
  jobId: JobId;
};

export type RetryJobUseCaseOutput = {
  jobId: JobId;
  attempts: number;
  nextAttemptAt: Date;
};

export class RetryJobUseCase
  implements Executable<RetryJobUseCaseInput, RetryJobUseCaseOutput>
{
  constructor(
    private readonly jobRepository: JobRepository,
    private readonly workerPool: WorkerPool
  ) {}

  async execute(input: RetryJobUseCaseInput): Promise<RetryJobUseCaseOutput> {
    // 1. Buscar o job
    const job = await this.jobRepository.findById(input.jobId);
    if (!job) {
      throw new Error("Job not found");
    }

    // 2. Verificar se pode ser retentado
    if (!job.retryPolicy) {
      throw new Error("Job has no retry policy");
    }

    const retryPolicy = new RetryPolicy({
      maxAttempts: job.retryPolicy.value.maxAttempts,
      delayBetweenAttempts: job.retryPolicy.value.delayBetweenAttempts,
    });

    if (job.attempts >= retryPolicy.value.maxAttempts) {
      throw new Error("Max retry attempts reached");
    }

    // 3. Calcular próximo attempt (backoff exponencial)
    const nextAttemptDelay = this.calculateNextAttemptDelay(
      job.attempts,
      retryPolicy.value.delayBetweenAttempts
    );
    const nextAttemptAt = new Date(Date.now() + nextAttemptDelay);

    // 4. Atualizar job com nova tentativa e status RETRYING
    const updatedJob = job.withAttempt(
      job.attempts + 1,
      nextAttemptAt,
      new JobStatus("RETRYING")
    );

    await this.jobRepository.update(updatedJob);

    // 6. Reenfileirar
    await this.workerPool.enqueue(updatedJob);

    return {
      jobId: job.id,
      attempts: updatedJob.attempts,
      nextAttemptAt,
    };
  }

  private calculateNextAttemptDelay(
    attempts: number,
    baseDelay: number
  ): number {
    return baseDelay * Math.pow(2, attempts);
  }
}
