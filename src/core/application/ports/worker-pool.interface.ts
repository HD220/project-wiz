import { WorkerId } from "../../domain/entities/worker/value-objects/worker-id.vo";
import { Job } from "../../domain/entities/job/job.entity";
import { Worker } from "../../domain/entities/worker/worker.entity";

export interface WorkerPool {
  addWorker(worker: Worker): Promise<void>;
  removeWorker(workerId: WorkerId): Promise<void>;
  getAvailableWorkers(): Promise<Worker[]>;
  assignJob(workerId: WorkerId, job: Job): Promise<void>;
}
