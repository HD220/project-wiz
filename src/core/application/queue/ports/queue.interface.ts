import { Result } from "../../../../shared/core";
import { Job } from "../../../domain/entities/queue/job.entity";

export interface QueueManager {
  addJob(job: Job): Promise<Result<void>>;
  processNextJob(): Promise<Result<Job>>;
  retryFailedJob(jobId: string): Promise<Result<Job>>;
  prioritizeJob(jobId: string): Promise<Result<void>>;
  getJobStatus(jobId: string): Promise<Result<string>>;
}
