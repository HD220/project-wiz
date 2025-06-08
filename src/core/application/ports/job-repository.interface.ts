import { Job } from "../../domain/entities/job/job.entity";
import { JobId } from "../../domain/entities/job/value-objects/job-id.vo";
import { Result } from "../../../shared/result";

export interface JobRepository {
  create(job: Job): Promise<Result<Job>>;
  findById(id: JobId): Promise<Result<Job>>;
  update(job: Job): Promise<Result<Job>>;
  delete(id: JobId): Promise<Result<void>>;
  list(): Promise<Result<Job[]>>;
}
