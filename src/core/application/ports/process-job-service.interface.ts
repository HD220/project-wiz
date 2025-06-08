import { Job } from "../../domain/entities/job/job.entity";
import { Worker } from "../../domain/entities/worker/worker.entity";
import { Result } from "../../../shared/result";

export interface ProcessJobService {
  process(job: Job, worker: Worker): Promise<Result<Job>>;
}
