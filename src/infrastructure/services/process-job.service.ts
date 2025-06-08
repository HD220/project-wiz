import { ProcessJobService } from "../../core/application/ports/process-job-service.interface";
import { Job } from "../../core/domain/entities/job/job.entity";
import { Worker } from "../../core/domain/entities/worker/worker.entity";
import { Result, ok, error } from "../../shared/result";
import { JobRepository } from "../../core/application/ports/job-repository.interface";
import { QueueService } from "../../core/application/ports/queue-service.interface";
import { JobId } from "../../core/domain/entities/job/value-objects/job-id.vo";

export class ProcessJobServiceImpl implements ProcessJobService {
  constructor(
    private readonly jobRepository: JobRepository,
    private readonly queueService: QueueService
  ) {}

  async process(job: Job, worker: Worker): Promise<Result<Job>> {
    try {
      if (job.status.value === "WAITING") {
        const dependencies = await this.checkDependencies(job);
        if (dependencies.isError()) {
          return error(dependencies.message);
        }
        if (!dependencies.value) {
          return ok(job);
        }
        return ok(job.start());
      }

      if (job.status.value === "DELAYED") {
        if (worker.status.value !== "available") {
          return ok(job);
        }

        const shouldProcess = await this.checkDelay(job);
        if (shouldProcess.isError()) {
          return error(shouldProcess.message);
        }
        if (!shouldProcess.value) {
          return ok(job);
        }
        return ok(job.start());
      }

      const processedJob = await this.executeJob(job, worker);

      if (processedJob.isError()) {
        if (
          job.retryPolicy &&
          job.attempts < job.retryPolicy.value.maxAttempts
        ) {
          const delayedJob = job.delay();
          await this.queueService.enqueue(delayedJob);
          return error(`Job falhou e será retentado: ${processedJob.message}`);
        }
        return error(processedJob.message);
      }

      return ok(processedJob.value);
    } catch (err) {
      return error(
        `Erro inesperado ao processar job: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }

  private async checkDependencies(job: Job): Promise<Result<boolean>> {
    try {
      const { dependencies } = job.metadata || {};
      if (!dependencies) return ok(true);

      if (!Array.isArray(dependencies)) {
        return error("Metadata.dependencies deve ser um array de strings");
      }

      const results = await Promise.all(
        dependencies.map(async (jobId: string) => {
          if (typeof jobId !== "string") return false;

          const result = await this.jobRepository.findById(new JobId(jobId));
          return result.isOk()
            ? ["COMPLETED", "CANCELLED"].includes(result.value.status.value)
            : false;
        })
      );

      return ok(results.every(Boolean));
    } catch (err) {
      return error(
        `Falha na verificação de dependências: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }

  private async checkDelay(job: Job): Promise<Result<boolean>> {
    try {
      if (!job.retryPolicy || !job.updatedAt) {
        return ok(true);
      }

      const delayMs = job.calculateBackoffDelay();
      const now = new Date();
      const delayedUntil = new Date(job.updatedAt.getTime() + delayMs);

      return ok(now >= delayedUntil);
    } catch (err) {
      return error(
        `Falha ao verificar delay: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }

  private async executeJob(job: Job, _worker: Worker): Promise<Result<Job>> {
    try {
      // Simula falha quando o repositório retorna erro
      const result = await this.jobRepository.findById(job.id);
      if (result.isError()) {
        return error(result.message);
      }

      // TODO: Implementar lógica real de execução do job
      return ok(job.complete());
    } catch (err) {
      return error(
        `Falha ao executar job: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }
}
