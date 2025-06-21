// src/core/application/services/worker-assignment.service.ts
import { Result, ok, error } from '@/shared/result';
import { Worker } from '@/core/domain/entities/worker/worker.entity';
import { WorkerId } from '@/core/domain/entities/worker/value-objects/worker-id.vo';
import { IWorkerAssignmentService } from '../ports/worker-assignment-service.interface';
import { IWorkerRepository } from '../ports/repositories/worker.repository.interface';
import { DomainError } from '@/core/common/errors';
import { JobTimestamp } from '@/core/domain/entities/job/value-objects/job-timestamp.vo'; // For updatedAt

export class WorkerAssignmentServiceImpl implements IWorkerAssignmentService {
    constructor(
        private readonly workerRepository: IWorkerRepository
    ) {}

    async assignWorker(workerId: WorkerId): Promise<Result<Worker>> {
        try {
            const workerResult = await this.workerRepository.load(workerId);

            if (workerResult.isError()) {
                return error(new DomainError(`Failed to load worker ${workerId.getValue()}: ${workerResult.message}`));
            }
            const worker = workerResult.value;

            if (!worker) {
                return error(new DomainError(`Worker with ID ${workerId.getValue()} not found.`));
            }

            if (!worker.isAvailable()) {
                return error(new DomainError(`Worker ${workerId.getValue()} is not available. Current status: ${worker.getProps().status.getValue()}`));
            }

            // Marcar worker como ocupado e salvar
            const allocatedWorker = worker.allocateToJob(JobTimestamp.now()); // Pass current timestamp

            const saveResult = await this.workerRepository.save(allocatedWorker);
            if (saveResult.isError()) {
                // TODO: Consider implications if save fails after in-memory state change.
                // For now, log and return the save error.
                console.error(`Failed to save allocated worker ${allocatedWorker.id().getValue()}: ${saveResult.message}`);
                return error(new DomainError(`Failed to save allocated worker state: ${saveResult.message}`));
            }

            return ok(allocatedWorker);

        } catch (e) {
            console.error(`Error in WorkerAssignmentServiceImpl.assignWorker for workerId ${workerId.getValue()}:`, e);
            const domainError = e instanceof DomainError ? e : new DomainError("Failed to assign worker.", e instanceof Error ? e : undefined);
            return error(domainError);
        }
    }

    // TODO: Implementar outros métodos se definidos na interface, como:
    // async findAvailableWorker(): Promise<Result<Worker | null>> {
    //    // Logic to find any available worker from the repository
    //    // const availableWorkers = await this.workerRepository.findAllByStatus(WorkerStatus.createAvailable());
    //    // if (availableWorkers.isError() || !availableWorkers.value || availableWorkers.value.length === 0) {
    //    //     return error(new DomainError("No available workers found."));
    //    // }
    //    // return ok(availableWorkers.value[0]); // Simplistic: return the first one
    //    // return error(new DomainError("findAvailableWorker not implemented."));
    // }

    public async findAvailableWorker(): Promise<Result<Worker | null>> {
        try {
            const availableWorkerResult = await this.workerRepository.findFirstAvailable();

            if (availableWorkerResult.isError()) {
                // Log the error, but this might not be a "system" error, could just be no workers.
                // However, if findFirstAvailable itself fails (e.g. DB connection), it's an error.
                console.error(`Error finding available worker: ${availableWorkerResult.message}`);
                return error(new DomainError(`Error finding available worker: ${availableWorkerResult.message}`));
            }

            const availableWorker = availableWorkerResult.value; // This could be Worker | null

            if (!availableWorker) {
                return ok(null); // No worker available, but operation was successful.
            }

            // The service method just finds. It does not allocate here.
            // Allocation (marking as BUSY) should be done by the caller if needed,
            // possibly by calling assignWorker with the ID of the found worker.
            return ok(availableWorker);

        } catch (e) {
            console.error("Unexpected error in WorkerAssignmentServiceImpl.findAvailableWorker:", e);
            const domainError = e instanceof DomainError ? e : new DomainError("Failed to find available worker due to an unexpected error.", e instanceof Error ? e : undefined);
            return error(domainError);
        }
    }
}
