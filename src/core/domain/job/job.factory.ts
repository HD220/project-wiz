import { JobStatus, JobEntityProps } from "./job.types";
import { JobIdVO } from "./value-objects/job-id.vo";
import { IJobOptions, JobOptionsVO } from "./value-objects/job-options.vo";

export class JobFactory {
  public static createJobProps<P, R>(params: {
    id?: JobIdVO;
    queueName: string;
    name: string;
    payload: P;
    options?: IJobOptions;
  }): JobEntityProps<P, R> {
    const jobOptions = JobOptionsVO.create(params.options);
    const idFromOptions = jobOptions.jobId;
    const finalJobId =
      params.id ||
      (idFromOptions ? JobIdVO.create(idFromOptions) : JobIdVO.create());
    const now = new Date();

    return {
      id: finalJobId,
      queueName: params.queueName,
      name: params.name,
      payload: params.payload,
      options: jobOptions,
      status: (jobOptions.delay && jobOptions.delay > 0) ? JobStatus.DELAYED : JobStatus.WAITING,
      attemptsMade: 0,
      progress: 0,
      logs: [],
      createdAt: now,
      updatedAt: now,
      delayUntil: (jobOptions.delay && jobOptions.delay > 0) ? new Date(now.getTime() + jobOptions.delay) : null,
    };
  }
}
