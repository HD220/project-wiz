// src/infrastructure/ipc-services/ipc-job-queue-adapter.ts
import { IJobQueue } from '../../core/application/ports/job-queue.interface';
import { Job } from '../../core/domain/entities/job/job.entity';
import { JobId } from '../../core/domain/entities/job/value-objects';
import { Result, ok, error } from '../../shared/result';
import { DomainError } from '../../core/common/errors';

// Placeholder for sendRequestToMain
declare function sendRequestToMain<T_REQ_PAYLOAD, T_RES_DATA>(type: string, payload: T_REQ_PAYLOAD): Promise<T_RES_DATA>;

export class IPCJobQueueAdapter implements IJobQueue {
    async addJob(job: Job): Promise<Result<void>> {
        try {
            const plainJob = job.toPlainObject(); // Assumes Job has toPlainObject()
            await sendRequestToMain<{ jobData: any }, void>('JOB_QUEUE_ADD_JOB', { jobData: plainJob });
            return ok(undefined);
        } catch (e) {
            const err = e instanceof Error ? e : new Error(String(e));
            return error(new DomainError(`IPCJobQueueAdapter.addJob failed for job ${job.id().getValue()}: ${err.message}`));
        }
    }

    async getNextJob(): Promise<Result<Job | null>> {
        // This method should typically not be called by a worker.
        // The main process (Worker Pool) is responsible for polling the queue.
        console.warn("IPCJobQueueAdapter.getNextJob was called from a worker. This is generally not expected.");
        return error(new DomainError("Operation 'getNextJob' is not supported from worker via IPC."));
    }

    async removeJob(jobId: JobId): Promise<Result<void>> {
        try {
            await sendRequestToMain<{ jobId: string }, void>('JOB_QUEUE_REMOVE_JOB', { jobId: jobId.getValue() });
            return ok(undefined);
        } catch (e) {
            const err = e instanceof Error ? e : new Error(String(e));
            return error(new DomainError(`IPCJobQueueAdapter.removeJob failed for JobID ${jobId.getValue()}: ${err.message}`));
        }
    }
}
