// src/infrastructure/ipc-services/ipc-worker-repository.ts
import { IWorkerRepository } from '../../core/ports/repositories/worker.repository.interface';
import { Worker } from '../../core/domain/entities/worker/worker.entity'; // Assuming WorkerProps from here
import { WorkerId } from '../../core/domain/entities/worker/value-objects'; // Assuming WorkerId from here
import { Result, ok, error } from '../../shared/result';
import { DomainError } from '../../core/common/errors';

// Define WorkerProps based on typical entity structure, adjust if Worker entity is different
interface AssumedWorkerProps {
    id: WorkerId;
    name?: string; // Example property
    status?: any; // Example property, replace with actual WorkerStatus VO if exists
    // other fields...
}


// Placeholder for sendRequestToMain and rehydrateWorker
declare function sendRequestToMain<T_REQ_PAYLOAD, T_RES_DATA>(type: string, payload: T_REQ_PAYLOAD): Promise<T_RES_DATA>;
declare function rehydrateWorker(plainWorkerData: any): Worker;

export class IPCWorkerRepository implements IWorkerRepository {
    async create(props: Omit<AssumedWorkerProps, "id">): Promise<Result<Worker>> {
        try {
            const responseData = await sendRequestToMain<Omit<AssumedWorkerProps, "id">, any>('WORKER_REPO_CREATE', props);
            if (!responseData) {
                return error(new DomainError("IPCWorkerRepository: Failed to create worker, no response data."));
            }
            return ok(rehydrateWorker(responseData));
        } catch (e) {
            const err = e instanceof Error ? e : new Error(String(e));
            return error(new DomainError(`IPCWorkerRepository.create failed: ${err.message}`));
        }
    }

    async load(id: WorkerId): Promise<Result<Worker | null>> {
        try {
            const responseData = await sendRequestToMain<{ id: string }, any>('WORKER_REPO_LOAD', { id: id.getValue() });
            if (!responseData) {
                return ok(null);
            }
            return ok(rehydrateWorker(responseData));
        } catch (e) {
            const err = e instanceof Error ? e : new Error(String(e));
            return error(new DomainError(`IPCWorkerRepository.load failed for ID ${id.getValue()}: ${err.message}`));
        }
    }

    async save(worker: Worker): Promise<Result<Worker>> {
        try {
            const plainWorker = (worker as any).toPlainObject ? (worker as any).toPlainObject() : worker;
            const responseData = await sendRequestToMain<{ workerData: any }, any>('WORKER_REPO_SAVE', { workerData: plainWorker });
            if (!responseData) {
                 return error(new DomainError(`IPCWorkerRepository: Failed to save worker ${worker.id().getValue()}, no confirmation data.`));
            }
            return ok(rehydrateWorker(responseData));
        } catch (e) {
            const err = e instanceof Error ? e : new Error(String(e));
            return error(new DomainError(`IPCWorkerRepository.save failed for worker ${worker.id().getValue()}: ${err.message}`));
        }
    }

    async list(): Promise<Result<Worker[]>> {
        try {
            const responseData = await sendRequestToMain<void, any[]>('WORKER_REPO_LIST', undefined);
            if (!responseData) {
                return error(new DomainError("IPCWorkerRepository.list: No response data."));
            }
            return ok(responseData.map(rehydrateWorker));
        } catch (e) {
            const err = e instanceof Error ? e : new Error(String(e));
            return error(new DomainError(`IPCWorkerRepository.list failed: ${err.message}`));
        }
    }

    async delete(id: WorkerId): Promise<Result<void>> {
        try {
            await sendRequestToMain<{ id: string }, void>('WORKER_REPO_DELETE', { id: id.getValue() });
            return ok(undefined);
        } catch (e) {
            const err = e instanceof Error ? e : new Error(String(e));
            return error(new DomainError(`IPCWorkerRepository.delete failed for ID ${id.getValue()}: ${err.message}`));
        }
    }

    async findFirstAvailable(): Promise<Result<Worker | null>> {
        try {
            const responseData = await sendRequestToMain<void, any>('WORKER_REPO_FIND_FIRST_AVAILABLE', undefined);
            if (!responseData) {
                return ok(null);
            }
            return ok(rehydrateWorker(responseData));
        } catch (e) {
            const err = e instanceof Error ? e : new Error(String(e));
            return error(new DomainError(`IPCWorkerRepository.findFirstAvailable failed: ${err.message}`));
        }
    }
}
