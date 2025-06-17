import { Job } from "@/core/domain/entities/job/job.entity";
import { Task } from "@/core/ports/task.interface";
import { Result, error, ok } from "@/shared/result";
import { HelloWorldTask } from "@/core/domain/entities/task/hello-world.task";

export interface ITaskFactory {
  createTask(job: Job): Result<Task>;
}

export class TaskFactoryImpl implements ITaskFactory {
  createTask(job: Job): Result<Task> {
    switch (job.name) {
      case "HelloWorld":
        return ok(new HelloWorldTask());
      default:
        return error(`No task found for job name: ${job.name}`);
    }
  }
}
