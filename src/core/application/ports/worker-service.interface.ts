import { Worker } from "../../domain/entities/worker/worker.entity";
import { WorkerId } from "../../domain/entities/worker/value-objects/worker-id.vo";
import { Result } from "../../../shared/result";

export interface WorkerService {
  register(worker: Worker): Promise<Result<Worker>>;
  findById(id: WorkerId): Promise<Result<Worker>>;
  update(worker: Worker): Promise<Result<Worker>>;
  unregister(id: WorkerId): Promise<Result<void>>;
  list(): Promise<Result<Worker[]>>;
}
