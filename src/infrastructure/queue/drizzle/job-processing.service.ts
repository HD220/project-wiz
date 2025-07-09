// src/infrastructure/queue/drizzle/job-processing.service.ts
import EventEmitter from "node:events";

import { IJobRepository } from "@/core/application/ports/job-repository.interface";
import { JobEntity, JobStatus } from "@/core/domain/job/job.entity";
import { JobIdVO } from "@/core/domain/job/value-objects/job-id.vo";
// IJobOptions might be needed if default options are used from a central place, but likely not for this service.
import { AgentQueueService } from '@/core/application/agent-queues/services/agent-queue.service';
import { JobQueueEntry } from '@/core/application/agent-queues/domain/job-queue-entry.entity';

function isJobEntity<P extends { userId?: string }, R>(
  job: unknown
): job is JobEntity<P, R> {
  return job instanceof JobEntity;
}

// This service could implement a more specific interface like IJobProcessorService
export class JobProcessingService<P extends { userId?: string }, R> {
  constructor(
    private readonly jobRepository: IJobRepository<P, R>,
    // Or a dedicated JobEventEmitter
    private readonly eventEmitter: EventEmitter,
    // Needed for some repository calls if they are queue-specific
    private readonly queueName: string,
    private readonly agentQueueService: AgentQueueService
  ) {}

  // Corresponds to AbstractQueue.fetchNextJobAndLock
  async fetchNextJobAndLock(
    workerId: string,
    lockDurationMs: number,
    agentId?: string
  ): Promise<JobEntity<P, R> | null> {
    let jobToProcess: JobEntity<P, R> | null = null;

    if (agentId) {
      const agentQueueEntry: JobQueueEntry | null = await this.agentQueueService.dequeue(agentId);
      if (agentQueueEntry) {
        const job = await this.jobRepository.findById(JobIdVO.create(agentQueueEntry.jobId));
        // Ensure job is pending and is of the correct type
        if (job && isJobEntity<P, R>(job) && job.status === JobStatus.PENDING) {
          jobToProcess = job;
        } else if (job) {
          console.warn(`Job ${agentQueueEntry.jobId} from agent queue for ${agentId} is not in PENDING state. Status: ${job.status}`);
        }
        // If job is null (not found), it will just proceed to return null later
      }
    } else {
      // Fallback to general queue if no agentId is provided
      const jobs = await this.jobRepository.findNextJobsToProcess(
        this.queueName,
        1
      );
      if (jobs.length > 0 && isJobEntity<P, R>(jobs[0])) {
        jobToProcess = jobs[0];
      }
    }

    if (!jobToProcess) {
      return null;
    }

    // Common locking logic
    const job = jobToProcess;
    const lockUntil = new Date(Date.now() + lockDurationMs);
    const locked = await this.jobRepository.acquireLock(
      job.id,
      workerId,
      lockUntil
    );

    if (locked) {
      job.moveToActive(workerId, lockUntil);
      await this.jobRepository.update(job);
      this.eventEmitter.emit("job.active", job);
      return job;
    }

    if (agentId && jobToProcess) {
        console.warn(`Failed to lock job ${jobToProcess.id.value} for agent ${agentId}. Job was dequeued from agent queue but could not be locked.`);
    }

    return null;
  }

  // Corresponds to AbstractQueue.extendJobLock
  async extendJobLock(
    jobId: string | JobIdVO,
    workerId: string,
    lockDurationMs: number
  ): Promise<void> {
    const id = jobId instanceof JobIdVO ? jobId : JobIdVO.create(jobId);
    const job = await this.jobRepository.findById(id);
    if (!job || !isJobEntity<P, R>(job)) {
      return;
    }
    if (job.workerId === workerId && job.status === JobStatus.ACTIVE) {
      const newLockUntil = new Date(Date.now() + lockDurationMs);
      job.extendLock(newLockUntil, workerId);
      await this.jobRepository.update(job);
      this.eventEmitter.emit("job.lock.extended", job);
    }
  }

  // Corresponds to AbstractQueue.markJobAsCompleted
  async markJobAsCompleted(
    jobId: string | JobIdVO,
    workerId: string,
    result: R,
    // This param might be simplified or handled differently
    _jobInstanceWithChanges?: JobEntity<P, R>
  ): Promise<void> {
    const id = jobId instanceof JobIdVO ? jobId : JobIdVO.create(jobId);
    const job = await this.jobRepository.findById(id);
    if (job && job.workerId === workerId) {
      job.markAsCompleted(result);
      await this.jobRepository.update(job);
      this.eventEmitter.emit("job.completed", job);
    }
  }

  // Corresponds to AbstractQueue.markJobAsFailed
  async markJobAsFailed(
    jobId: string | JobIdVO,
    workerId: string,
    error: Error,
    // This param might be simplified or handled differently
    _jobInstanceWithChanges?: JobEntity<P, R>
  ): Promise<void> {
    const id = jobId instanceof JobIdVO ? jobId : JobIdVO.create(jobId);
    const job = await this.jobRepository.findById(id);
    if (!job || !isJobEntity<P, R>(job)) {
      return;
    }
    if (job.workerId === workerId) {
      this._handleFailedJobRetryOrPermanentFail(job, error);
      await this.jobRepository.update(job);
      this.eventEmitter.emit("job.failed", job);
    }
  }

  private _handleFailedJobRetryOrPermanentFail(
    job: JobEntity<P, R>,
    error: Error
  ): void {
    if (job.attemptsMade < job.maxAttempts) {
      // Default delay
      let backoffDelay = 1000;
      if (job.options.backoff && typeof job.options.backoff === "object") {
        const baseDelay = job.options.backoff.delay || 1000;
        backoffDelay = baseDelay;
        if (job.options.backoff.type === "exponential") {
          const currentAttempt = Math.max(1, job.attemptsMade);
          backoffDelay = baseDelay * Math.pow(2, currentAttempt - 1);
        }
        const maxBackoff = job.options.maxDelay || 3600000;
        backoffDelay = Math.min(backoffDelay, maxBackoff);
      } else if (typeof job.options.backoff === "function") {
        // If it's a function, execute it to get the delay
        backoffDelay = job.options.backoff(job.attemptsMade, error);
      }
      job.moveToDelayed(new Date(Date.now() + backoffDelay), error);
    } else {
      job.markAsFailed(error.message, error.stack?.split("\n"));
    }
  }

  // Corresponds to AbstractQueue.updateJobProgress
  async updateJobProgress(
    jobId: string | JobIdVO,
    workerId: string,
    progress: number | object
  ): Promise<void> {
    const id = jobId instanceof JobIdVO ? jobId : JobIdVO.create(jobId);
    const job = await this.jobRepository.findById(id);
    if (!job || !isJobEntity<P, R>(job)) {
      return;
    }
    if (job.workerId === workerId) {
      job.updateProgress(progress);
      await this.jobRepository.update(job);
      this.eventEmitter.emit("job.progress", job);
    }
  }

  // Corresponds to AbstractQueue.addJobLog
  async addJobLog(
    jobId: string | JobIdVO,
    workerId: string,
    message: string,
    level?: string
  ): Promise<void> {
    const id = jobId instanceof JobIdVO ? jobId : JobIdVO.create(jobId);
    const job = await this.jobRepository.findById(id);
    if (!job || !isJobEntity<P, R>(job)) {
      return;
    }
    if (job && job.workerId === workerId) {
      job.addLog(message, level);
      await this.jobRepository.update(job);
      this.eventEmitter.emit("job.log", job);
    }
  }
}
