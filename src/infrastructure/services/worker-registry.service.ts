import { IWorkerRegistryService } from "../../core/application/ports/worker-registry.service.interface";
import { Worker } from "../../core/domain/entities/worker/worker.entity";
import { WorkerId } from "../../core/domain/entities/worker/value-objects/worker-id.vo";
import { Result, ok, error } from "../../shared/result";
import { WorkerRepository } from "../../core/application/ports/worker-repository.interface";

export class WorkerRegistryServiceImpl implements IWorkerRegistryService {
  constructor(private readonly workerRepository: WorkerRepository) {}

  async register(worker: Worker): Promise<Result<Worker>> {
    try {
      const existingWorker = await this.workerRepository.findById(worker.id);
      if (existingWorker.isOk()) {
        return error("Worker já registrado");
      }

      const createdWorker = await this.workerRepository.create(worker);
      if (createdWorker.isError()) {
        return error(createdWorker.message);
      }

      return ok(createdWorker.value);
    } catch (err) {
      return error(err instanceof Error ? err.message : String(err));
    }
  }

  async findById(id: WorkerId): Promise<Result<Worker>> {
    try {
      return await this.workerRepository.findById(id);
    } catch (err) {
      return error(err instanceof Error ? err.message : String(err));
    }
  }

  async update(worker: Worker): Promise<Result<Worker>> {
    try {
      const existingWorker = await this.workerRepository.findById(worker.id);
      if (existingWorker.isError()) {
        return error(existingWorker.message);
      }

      return await this.workerRepository.update(worker);
    } catch (err) {
      return error(err instanceof Error ? err.message : String(err));
    }
  }

  async unregister(id: WorkerId): Promise<Result<void>> {
    try {
      const existingWorker = await this.workerRepository.findById(id);
      if (existingWorker.isError()) {
        return error(existingWorker.message);
      }

      return await this.workerRepository.delete(id);
    } catch (err) {
      return error(err instanceof Error ? err.message : String(err));
    }
  }

  async list(): Promise<Result<Worker[]>> {
    try {
      return await this.workerRepository.list();
    } catch (err) {
      return error(err instanceof Error ? err.message : String(err));
    }
  }
}
