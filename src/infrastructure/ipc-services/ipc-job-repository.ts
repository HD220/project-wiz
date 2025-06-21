// src/infrastructure/ipc-services/ipc-job-repository.ts
import { IJobRepository } from '../../core/ports/repositories/job.repository.interface';
import { Job, JobProps } from '../../core/domain/entities/job/job.entity';
import { JobId } from '../../core/domain/entities/job/value-objects';
import { Result, ok, error } from '../../shared/result';
import { DomainError } from '../../core/common/errors';

// Placeholder for sendRequestToMain and rehydrateJob
// These will be defined/injected in the worker context (job-processor.worker.ts)
declare function sendRequestToMain<T_REQ_PAYLOAD, T_RES_DATA>(type: string, payload: T_REQ_PAYLOAD): Promise<T_RES_DATA>;
declare function rehydrateJob(plainJobData: any): Job; // Assumes rehydrateJob is globally available or passed

export class IPCJobRepository implements IJobRepository {
    async create(props: Omit<JobProps, "id">): Promise<Result<Job>> {
        try {
            const responseData = await sendRequestToMain<Omit<JobProps, "id">, any>('JOB_REPO_CREATE', props);
            if (!responseData) { // Assuming main process sends null or throws for creation failure handled by catch
                return error(new DomainError("IPCJobRepository: Failed to create job, no response data."));
            }
            return ok(rehydrateJob(responseData));
        } catch (e) {
            const err = e instanceof Error ? e : new Error(String(e));
            return error(new DomainError(`IPCJobRepository.create failed: ${err.message}`));
        }
    }

    async load(id: JobId): Promise<Result<Job | null>> {
        try {
            const responseData = await sendRequestToMain<{ id: string }, any>('JOB_REPO_LOAD', { id: id.getValue() });
            if (!responseData) {
                return ok(null);
            }
            return ok(rehydrateJob(responseData));
        } catch (e) {
            const err = e instanceof Error ? e : new Error(String(e));
            return error(new DomainError(`IPCJobRepository.load failed for ID ${id.getValue()}: ${err.message}`));
        }
    }

    async save(job: Job): Promise<Result<Job>> {
        try {
            // The main process will handle the actual save and might return the saved job (possibly updated)
            // For simplicity, we assume the job passed is what's "saved" or main process returns it.
            const plainJob = job.toPlainObject();
            const responseData = await sendRequestToMain<{ jobData: any }, any>('JOB_REPO_SAVE', { jobData: plainJob });
            if (!responseData) { // Or main process confirms save by returning the object
                 return error(new DomainError(`IPCJobRepository: Failed to save job ${job.id().getValue()}, no confirmation data.`));
            }
            return ok(rehydrateJob(responseData)); // Main returns the (potentially updated) job data
        } catch (e) {
            const err = e instanceof Error ? e : new Error(String(e));
            return error(new DomainError(`IPCJobRepository.save failed for job ${job.id().getValue()}: ${err.message}`));
        }
    }

    async list(): Promise<Result<Job[]>> {
        try {
            const responseData = await sendRequestToMain<void, any[]>('JOB_REPO_LIST', undefined);
            if (!responseData) {
                return error(new DomainError("IPCJobRepository.list: No response data."));
            }
            return ok(responseData.map(rehydrateJob));
        } catch (e) {
            const err = e instanceof Error ? e : new Error(String(e));
            return error(new DomainError(`IPCJobRepository.list failed: ${err.message}`));
        }
    }

    async delete(id: JobId): Promise<Result<void>> {
        try {
            await sendRequestToMain<{ id: string }, void>('JOB_REPO_DELETE', { id: id.getValue() });
            return ok(undefined);
        } catch (e) {
            const err = e instanceof Error ? e : new Error(String(e));
            return error(new DomainError(`IPCJobRepository.delete failed for ID ${id.getValue()}: ${err.message}`));
        }
    }

    async findNextProcessableJob(): Promise<Result<Job | null>> {
        try {
            const responseData = await sendRequestToMain<void, any>('JOB_REPO_FIND_NEXT_PROCESSABLE', undefined);
            if (!responseData) {
                return ok(null);
            }
            return ok(rehydrateJob(responseData));
        } catch (e) {
            const err = e instanceof Error ? e : new Error(String(e));
            return error(new DomainError(`IPCJobRepository.findNextProcessableJob failed: ${err.message}`));
        }
    }
}
