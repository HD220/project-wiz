import { Job, JobState } from "../job/job.interface";

export interface JobRepository<T = unknown> {
  save(job: Job<T>): Promise<void>;
  getById(id: string): Promise<Job<T> | null>;
  getNextJob(): Promise<Job<T> | null>;
  getJobsByStatus(status: JobState["status"]): Promise<Job<T>[]>;
  update(id: string, state: JobState): Promise<void>;
  clear(): Promise<void>;
}
