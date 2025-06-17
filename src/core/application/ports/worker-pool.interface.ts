import { WorkerId } from "../../domain/entities/worker/value-objects/worker-id.vo";
import { Job } from "../../domain/entities/job/job.entity";
import { Worker } from "../../domain/entities/worker/worker.entity";

export interface IWorkerPool {
  start(): Promise<void>;
  stop(): Promise<void>;
  processJob(job: Job): Promise<void>;
}
