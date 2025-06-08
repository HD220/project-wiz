import { JobId } from "../../domain/entities/job/value-objects/job-id.vo";
import { Job } from "../../domain/entities/job/job.entity";

export interface JobQueue {
  addJob(job: Job): Promise<void>;
  processJobs(): Promise<void>;
  on(
    event: "completed" | "failed" | "retrying",
    callback: (jobId: JobId, attempt?: number) => void
  ): void;
}
