import { WorkerJobService } from "../../core/application/ports/worker-job-service.interface";
import { Worker } from "../../core/domain/entities/worker/worker.entity";
import { Job } from "../../core/domain/entities/job/job.entity";
import { Result, ok, error } from "../../shared/result";
import { ProcessJobUseCase } from "../../core/application/use-cases/process-job.usecase";
import { QueueService } from "../../core/application/ports/queue-service.interface";

export class WorkerJobServiceImpl implements WorkerJobService {
  constructor(
    private readonly processJobUseCase: ProcessJobUseCase,
    private readonly queueService: QueueService
  ) {}

  async processJob(job: Job, worker: Worker): Promise<Result<Job>> {
    try {
      const result = await this.processJobUseCase.execute({
        jobId: job.id,
        workerId: worker.id.value.toString(),
      });

      if (result.isError()) {
        if (
          job.retryPolicy &&
          job.attempts < job.retryPolicy.value.maxAttempts
        ) {
          await this.queueService.enqueue(job);
          return error(`Job falhou mas será retentado: ${result.message}`);
        }
        return error(result.message);
      }

      return ok(job);
    } catch (err) {
      return error(
        `Erro inesperado ao processar job: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }
}
