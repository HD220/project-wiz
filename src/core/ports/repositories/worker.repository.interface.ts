import { IRepository } from '@/core/common/repository';
import { Worker } from '@/core/domain/entities/worker/worker.entity';
import { Result } from '@/shared/result';

export interface IWorkerRepository extends IRepository<typeof Worker> {
    /**
     * Finds the first available worker.
     * @returns A Result containing the first available Worker or null if none are available, or an error.
     */
    findFirstAvailable(): Promise<Result<Worker | null>>;

    // Potentially other worker-specific query methods, e.g.:
    // findAllByStatus(status: WorkerStatus): Promise<Result<Worker[]>>;
}
