import { Result } from "../../../shared/result";
import { Job } from "../../domain/entities/queue/job.entity";
import { JobId } from "../../domain/entities/queue/value-objects/job-id.vo";

export interface Queue {
  add(job: Job): Promise<Result<void>>;
  getNext(): Promise<Result<Job | null>>;
  getById(id: JobId): Promise<Result<Job | null>>;
  remove(id: JobId): Promise<Result<void>>;
  prioritize(id: JobId): Promise<Result<void>>;
  list(): Promise<Result<Job[]>>;
  clear(): Promise<Result<void>>;
}
