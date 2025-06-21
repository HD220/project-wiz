// src/infrastructure/queue/sqlite-job-queue.ts
import { Result, ok, error } from '@/shared/result';
import { IJobQueue } from '@/core/application/ports/job-queue.interface';
import { Job } from '@/core/domain/entities/job/job.entity';
import { JobId, JobStatus, JobStatusType } from '@/core/domain/entities/job/value-objects'; // Assuming JobStatusType is exported from JobStatus VO
import { IJobRepository } from '@/core/ports/repositories/job.repository.interface';
import { DomainError } from '@/core/common/errors';

export class SqliteJobQueue implements IJobQueue {
    constructor(
        private readonly jobRepository: IJobRepository
        // For more complex queue logic, direct DB access might be needed:
        // private readonly db: BetterSQLite3Database<typeof import('../services/drizzle/schemas')>
    ) {}

    async addJob(job: Job): Promise<Result<void>> {
        try {
            // The job is typically already saved to the JobRepository by the use case
            // before being added to the queue. This method can serve as a notification
            // or could update a specific 'enqueued_at' field if the queue was a separate table.
            // For a DB-backed queue relying on Job states, this might just log or verify.

            const jobProps = job.getProps();
            console.log(`Job ${job.id().getValue()} [${jobProps.name.getValue()}] with status ${jobProps.status.getValue()} noted by queue.`);

            if (!job.isPending() && !job.isDelayed()) {
                 console.warn(`Job ${job.id().getValue()} added to queue but is not in a PENDING or DELAYED state. Current status: ${jobProps.status.getValue()}`);
                 // Depending on strictness, could return an error:
                 // return error(new DomainError(`Job ${job.id().getValue()} must be PENDING or DELAYED to be actively queued.`));
            }

            // If the queue has a separate polling mechanism or trigger, this is where it might be activated.
            // For now, assume the job's state in the repository is the queue.
            return ok(undefined);
        } catch (e) {
            console.error(`Error in SqliteJobQueue.addJob for job ${job.id().getValue()}:`, e);
            return error(new DomainError("Failed to add job to queue.", e instanceof Error ? e : undefined));
        }
    }

    async getNextJob(): Promise<Result<Job | null>> {
        // This is the core logic for a DB-backed queue.
        // It requires IJobRepository to have a method to find processable jobs.
        // Such a method would typically:
        // 1. Filter by status (PENDING).
        // 2. Filter by runAt <= now for DELAYED jobs.
        // 3. Order by priority (desc) then createdAt (asc).
        // 4. Potentially handle dependency checks (complex: check if all dependent job IDs are FINISHED).
        // 5. Implement a locking mechanism (e.g., update status to a temporary "CLAIMED" or "dequeued")
        //    to prevent multiple workers from picking up the same job. This requires a transaction.

        try {
            const jobResult = await this.jobRepository.findNextProcessableJob();
            if (jobResult.isError()) {
                // Log the specific repository error before returning a more generic queue error
                console.error(`Error from jobRepository.findNextProcessableJob: ${jobResult.message.message}`, jobResult.message);
                return error(new DomainError("Failed to get next job from repository due to repository error."));
            }

            const job = jobResult.value; // This is Job | null
            if (!job) {
                return ok(null); // No job found, not an error condition for the queue
            }

            // Optional: "Claiming" logic (marking job as "dequeued" or "PRE_EXECUTING")
            // For simplicity, this version assumes the ProcessJobService will immediately mark it as EXECUTING.
            // If claiming were done here, it would involve:
            // 1. Transitioning job to a "CLAIMED" status (if such status exists).
            // 2. Saving the job back to the repository.
            // 3. If save fails, potentially try to unclaim or fetch another job.

            console.log(`Job ${job.id().getValue()} retrieved by queue to be processed.`);
            return ok(job);

        } catch (e) {
            // Catch any unexpected errors not already wrapped in Result by the repository
            console.error("Unexpected error in SqliteJobQueue.getNextJob:", e);
            return error(new DomainError("Failed to get next job from queue due to an unexpected error.", e instanceof Error ? e : undefined));
        }
    }

    async removeJob(jobId: JobId): Promise<Result<void>> {
        // For a DB-backed queue where job status dictates its presence in the "active" queue,
        // removing a job often means ensuring its status is terminal (e.g., CANCELLED, FAILED without retries, FINISHED).
        // The actual deletion from the DB is handled by jobRepository.delete().
        // This method might be more relevant for in-memory queues or queues that use separate tables.
        try {
            console.log(`Job ${jobId.getValue()} removal from queue noted. This is typically handled by setting job status to CANCELLED or another terminal state.`);

            // Optionally, verify the job's state:
            const jobResult = await this.jobRepository.load(jobId);
            if (jobResult.isOk() && jobResult.value) {
                const job = jobResult.value;
                if (!job.isCancelled() && !job.isFinished() && !job.isFailed()) { // Assuming !job.canBeRetried() for failed
                    // console.warn(`Job ${jobId.getValue()} 'removed' from queue but is not in a terminal state: ${job.getProps().status.getValue()}`);
                }
            } else {
                // console.warn(`Job ${jobId.getValue()} not found during removeJob, or error loading: ${jobResult.message}`);
            }
            return ok(undefined);
        } catch (e) {
            console.error(`Error in SqliteJobQueue.removeJob for job ${jobId.getValue()}:`, e);
            return error(new DomainError("Failed to process job removal from queue.", e instanceof Error ? e : undefined));
        }
    }
}
