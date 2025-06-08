import { Job } from "../domain/entities/job";

export interface Task {
  /**
   * Executes the Task logic
   * @param job Job data being processed
   * @returns void on success, undefined to reschedule, or throw Error for failure
   */
  execute(job: Job): Promise<void | undefined>;
}
