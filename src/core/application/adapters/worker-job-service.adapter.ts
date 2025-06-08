import { ProcessJobService } from "../ports/process-job-service.interface";
import { WorkerJobService } from "../ports/worker-job-service.interface";
import { JobRepository } from "../ports/job-repository.interface";
import { WorkerRepository } from "../ports/worker-repository.interface";
import { Job } from "../../domain/entities/job/job.entity";
import { Worker } from "../../domain/entities/worker/worker.entity";
import { Result, error } from "../../../shared/result";

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
}
