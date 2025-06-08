import { Job } from "../job";
import { Result } from "@/core/common/result";

export abstract class BaseTask {
  abstract execute(job: Job): Promise<Result<void>>;
}
