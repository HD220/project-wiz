import { Worker } from "../../domain/entities/worker/worker.entity";
import { Result } from "../../../shared/result";

export interface WorkerAssignmentService {
  assignWorker(workerId: string): Promise<Result<Worker>>;
}
