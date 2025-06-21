import { WorkerAssignmentService } from "../../core/application/ports/worker-assignment-service.interface";
import { Worker } from "../../core/domain/entities/worker/worker.entity";
import { Result, ok, error } from "../../shared/result";
import { WorkerRepository } from "../../core/application/ports/worker-repository.interface";
import { WorkerId } from "../../core/domain/entities/worker/value-objects/worker-id.vo";

export class WorkerAssignmentServiceImpl implements WorkerAssignmentService {
  constructor(private readonly workerRepository: WorkerRepository) {}

  async assignWorker(workerId: string): Promise<Result<Worker>> {
    if (!workerId) {
      return error("Worker ID não pode ser vazio");
    }

    try {
      const workerIdVO = new WorkerId(workerId);
      const workerResult = await this.workerRepository.findById(workerIdVO);

      if (workerResult.isError()) {
        return error(workerResult.message);
      }

      const worker = workerResult.value;
      if (worker.status.value !== "available") {
        return error(`Worker ${workerId} não está disponível`);
      }

      return ok(worker);
    } catch (err) {
      return error(
        `Erro ao atribuir worker: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }
}
