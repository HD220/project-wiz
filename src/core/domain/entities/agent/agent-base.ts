import { Task } from "@/core/ports/task.interface";
import { Job } from "../job/job.entity";

export abstract class AgentBase {
  protected abstract getTools(): unknown[];

  protected abstract createTask(job: Job): Task;

  async execute(job: Job): Promise<void | undefined> {
    try {
      const task = this.createTask(job);
      await task.execute(job);
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Unknown error occurred during task execution");
    }
  }
}
