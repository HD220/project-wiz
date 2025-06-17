import { Result } from "../../shared/result";
import { Job } from "../domain/entities/job/job.entity";
import { ITool } from "../application/tools/tool.interface";

import { ILLM } from "../application/llms/llm.interface";

export interface Task {
  /**
   * Executes the Task logic
   * @param job Job data being processed
   * @param tools Optional array of tools available to the task
   * @returns void on success, undefined to reschedule, or throw Error for failure
   */
  execute(job: Job, tools?: ITool[], llm?: ILLM): Promise<Result<void>>;
}
