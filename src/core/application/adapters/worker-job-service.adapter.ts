import { ProcessJobService } from "@/core/application/ports/process-job-service.interface";
import { WorkerJobService } from "@/core/application/ports/worker-job-service.interface";
import { JobRepository } from "@/core/application/ports/job-repository.interface";
import { WorkerRepository } from "@/core/application/ports/worker-repository.interface";
import { Job } from "@/core/domain/entities/job/job.entity";
import { Worker } from "@/core/domain/entities/worker/worker.entity";
import { Result, error, ok } from "@/shared/result"; // Adicionado 'ok'

export class WorkerJobServiceAdapter implements ProcessJobService {
  constructor(
    private readonly workerJobService: WorkerJobService,
    private readonly jobRepository: JobRepository,
    private readonly workerRepository: WorkerRepository
  ) {}

  async process(job: Job, worker: Worker): Promise<Result<Job>> {
    try {
      // Obter entidades completas dos repositórios
      const jobResult = await this.jobRepository.findById(job.id);
      const workerResult = await this.workerRepository.findById(worker.id);

      if (jobResult.isError()) {
        return error(jobResult.message);
      }

      if (workerResult.isError()) {
        return error(workerResult.message);
      }

      return await this.workerJobService.processJob(
        jobResult.value,
        workerResult.value
      );
    } catch (err) {
      return error(
        `Erro ao processar job: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }

  // Implementação do método executeJob, que é responsabilidade do AgentService
  async executeJob(job: Job): Promise<Result<void>> {
    // Este método não deve ser chamado aqui, pois a execução real do job
    // é feita pelo AgentService. Este é um stub para satisfazer a interface.
    console.warn(
      `WorkerJobServiceAdapter.executeJob called for job: ${job.id.value}. This method should be handled by AgentService.`
    );
    return ok(undefined);
  }
}
