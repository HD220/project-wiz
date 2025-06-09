import { Job } from "../job/job.interface";
import { JobData, JobStatus } from "../job/job.interface";

export interface Queue<T = unknown, R = unknown> {
  add(job: JobData<T>, options?: QueueAddOptions): Promise<Job<T>>;
  getJob(id: string): Promise<Job<T> | null>;
  getJobs(status: JobStatus): Promise<Job<T>[]>;
  getNextJob(): Promise<Job<T> | null>;
  saveJob(job: Job<T, R>): Promise<void>;
}

export interface QueueAddOptions {
  delay?: number;
  attempts?: number;
  priority?: number;
}
