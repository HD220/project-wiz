import { JobStatus } from "../job-status.vo";
import { Job } from "../../job.entity";

export class PendingJobStatus extends JobStatus {
  constructor() {
    super("PENDING");
  }

  async onEnter(job: Job): Promise<void> {
    job.updateStatus(this);
  }

  async onExit(_job: Job): Promise<void> {
    // Placeholder para lógica futura
  }
}
