import { Worker, WorkerId, WorkerStatus } from '@/core/domain/entities/worker'; // Adjust path
import { IRepository } from './repository.interface';

export interface IWorkerRepository extends IRepository<Worker, WorkerId> {
  // Additional Worker-specific methods
  findIdleWorkers(limit: number): Promise<Worker[]>;
  findByStatus(status: WorkerStatus): Promise<Worker[]>;
}
