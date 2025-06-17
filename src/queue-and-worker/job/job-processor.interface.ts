import { Job } from "./job.interface";

export type JobProcessor<T = unknown, R = unknown | void> = (
  job: Job<T>
) => Promise<R>;
