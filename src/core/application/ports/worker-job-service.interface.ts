import { Worker } from "../../domain/entities/worker/worker.entity";
import { Job } from "../../domain/entities/job/job.entity";
import { Result } from "../../../shared/result";

export interface WorkerJobService {
  processJob(job: Job, worker: Worker): Promise<Result<Job>>;
}
