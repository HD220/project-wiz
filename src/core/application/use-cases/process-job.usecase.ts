import { Executable } from "../../../shared/executable";
import { Result, ok, error } from "../../../shared/result";
import { ProcessJobSchema, ProcessJobInput } from "./process-job.schema";
import { IJobRepository } from "../ports/job-repository.interface"; // Using IJobRepository
// Assuming these interfaces are defined in their respective files or placeholders for now
import { Worker } from "../../domain/entities/worker/worker.entity";
import { Job } from "../../domain/entities/job/job.entity";
import { WorkerId } from "../../domain/entities/worker/value-objects/worker-id.vo";
import { DomainError } from "@/core/common/errors";


// Placeholder interfaces if not defined in separate files yet
export interface IWorkerAssignmentService {
  assignWorker(workerId: WorkerId): Promise<Result<Worker>>;
}

export interface IProcessJobService {
  process(job: Job, worker: Worker): Promise<Result<Job>>;
}

export class ProcessJobUseCase
  implements Executable<ProcessJobInput, Result<Job>>
{
  constructor(
    private readonly jobRepository: IJobRepository,
    private readonly processJobService: IProcessJobService, // Use interface
    private readonly workerAssignmentService: IWorkerAssignmentService // Use interface
  ) {}

  async execute(input: ProcessJobInput): Promise<Result<Job>> {
    const validation = ProcessJobSchema.safeParse(input);
    if (!validation.success) {
      // Use flatten().fieldErrors for more structured error information if desired
      return error(validation.error.flatten().fieldErrors as any); // Cast as any to simplify error type for now
    }
    const validInput = validation.data;

    // Delegate main logic to a private method
    return this.performProcessing(validInput);
  }

  private async performProcessing(input: ProcessJobInput): Promise<Result<Job>> {
    try {
      // Step 1: Load Job
      // Assuming jobRepository.load returns Result<Job | null> or Result<Job, Error>
      // Adapting to Result<Job, Error> for consistency with prompt
      const jobResult = await this.jobRepository.load(input.jobId);
      if (jobResult.isError()) {
        // If load can return null for not found, that should be handled too.
        // e.g. if (jobResult.isError() || !jobResult.value)
        return error(new DomainError(`Job ${input.jobId.getValue()} not found or failed to load: ${jobResult.message}`));
      }
      const job = jobResult.value;
      if (!job) { // Explicit null check if load can return Result<null, Error> for not found
          return error(new DomainError(`Job ${input.jobId.getValue()} not found.`));
      }


      // Step 2: Assign Worker
      // WorkerId is already a VO from validated input
      const workerResult = await this.workerAssignmentService.assignWorker(input.workerId);
      if (workerResult.isError()) {
        return error(new DomainError(`Failed to assign worker ${input.workerId.getValue()}: ${workerResult.message}`));
      }
      const worker = workerResult.value;


      // Step 3: Process Job
      const processedJobResult = await this.processJobService.process(job, worker);
      if (processedJobResult.isError()) {
        return error(new DomainError(`Failed to process job ${job.id().getValue()} with worker ${worker.id().getValue()}: ${processedJobResult.message}`));
      }
      return ok(processedJobResult.value);

    } catch (err) {
      // Log the error internally for observability
      console.error("Unexpected error in ProcessJobUseCase:", err);
      return error(new DomainError(err instanceof Error ? err.message : "Failed to process job due to unexpected error"));
    }
  }
}
