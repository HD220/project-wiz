import { Job } from "@/core/domain/entities/job/job.entity";
import { Result } from "@/shared/result";

export interface IAgentService {
  executeTask(job: Job): Promise<Result<void>>;
}
