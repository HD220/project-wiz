import { Worker } from "../../domain/entities/worker/worker.entity";
import { Result } from "../../../shared/result";
import { WorkerId } from "../../domain/entities/worker/value-objects/worker-id.vo"; // Added import

export interface IWorkerAssignmentService { // Renamed
  assignWorker(workerId: WorkerId): Promise<Result<Worker>>; // Changed parameter type
  findAvailableWorker(): Promise<Result<Worker | null>>; // Added method
}
