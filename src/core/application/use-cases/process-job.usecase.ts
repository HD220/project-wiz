import { Executable } from "../../../shared/executable";
import { Result, ok, error } from "../../../shared/result";
import { ProcessJobSchema, ProcessJobInput } from "./process-job.schema";
import { JobRepository } from "../ports/job-repository.interface";
import { ProcessJobService } from "../ports/process-job-service.interface";
import { WorkerAssignmentService } from "../ports/worker-assignment-service.interface";
import { Job } from "../../domain/entities/job/job.entity";
// Removido import de Worker

export class ProcessJobUseCase
  implements Executable<ProcessJobInput, Result<Job>>
{
  constructor(
    private readonly jobRepository: JobRepository,
    private readonly processJobService: ProcessJobService,
    private readonly workerAssignmentService: WorkerAssignmentService
  ) {}

  async execute(input: ProcessJobInput): Promise<Result<Job>> {
    const validation = ProcessJobSchema.safeParse(input);
    if (!validation.success) {
      return error(validation.error.message);
    }

    try {
      const jobResult = await this.jobRepository.findById(input.jobId);
      if (jobResult.isError()) {
        return error(jobResult.message);
      }
      const job = jobResult.value;

      const workerResult = await this.workerAssignmentService.assignWorker(
        input.workerId
      );
      if (workerResult.isError()) {
        return error(workerResult.message);
      }
      const worker = workerResult.value;

      const processedJobResult = await this.processJobService.process(
        job,
        worker
      );
      if (processedJobResult.isError()) {
        return error(processedJobResult.message);
      }
      return ok(processedJobResult.value);
    } catch (err) {
      return error(
        err instanceof Error ? err.message : "Failed to process job"
      );
    }
  }
}
