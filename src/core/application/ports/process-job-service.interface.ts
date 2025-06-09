import { Job } from "@/core/domain/entities/job/job.entity";
import { Worker } from "@/core/domain/entities/worker/worker.entity";
import { Result } from "@/shared/result";

import { IAgentService } from "./agent-service.interface";

export interface ProcessJobService {
  process(job: Job, worker: Worker): Promise<Result<Job>>;
  executeJob(job: Job): Promise<Result<void>>;
}
