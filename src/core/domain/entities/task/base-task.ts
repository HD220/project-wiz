import { Task } from "@/core/ports/task.interface";
import { Job } from "@/core/domain/entities/job/job.entity";
import { Result } from "@/shared/result";
import { ITool } from "@/core/application/tools/tool.interface";
import { ILLM } from "@/core/application/llms/llm.interface";

export abstract class BaseTask implements Task {
  public abstract execute(
    job: Job,
    tools?: ITool[],
    llm?: ILLM
  ): Promise<Result<void>>;
}
