import { JobId } from "@/core/domain/entities/job/value-objects/job-id.vo";
import { Job } from "@/core/domain/entities/job/job.entity";

export interface JobQueue {
  addJob(job: Job): Promise<void>;
  processJobs(): Promise<void>;
  on(
    event: "completed" | "failed" | "retrying" | "new_job",
    callback: (job: Job, attempt?: number) => void
  ): void;
}
