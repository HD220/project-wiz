// src_refactored/infrastructure/queue/drizzle/job-processing.service.ts
import EventEmitter from 'node:events';

import { IJobRepository } from "@/core/application/ports/job-repository.interface";
import { JobEntity, JobStatus } from "@/core/domain/job/job.entity";
import { JobIdVO } from "@/core/domain/job/value-objects/job-id.vo";
// IJobOptions might be needed if default options are used from a central place, but likely not for this service.

// This service could implement a more specific interface like IJobProcessorService
export class JobProcessingService<P, R> {
  constructor(
    private readonly jobRepository: IJobRepository,
    // Or a dedicated JobEventEmitter
    private readonly eventEmitter: EventEmitter,
    // Needed for some repository calls if they are queue-specific
    private readonly queueName: string
  ) {}

  // Corresponds to AbstractQueue.fetchNextJobAndLock
  async fetchNextJobAndLock(
    workerId: string,
    lockDurationMs: number
  ): Promise<JobEntity<P, R> | null> {
    // Assumes findNextJobsToProcess is queue-specific
    const jobs = await this.jobRepository.findNextJobsToProcess(
      this.queueName,
      1
    );
    if (jobs.length === 0) {
      return null;
    }

    const job = jobs[0] as JobEntity<P, R>;
    const jobProps = job.toPersistence();
    const lockUntil = new Date(Date.now() + lockDurationMs);
    const locked = await this.jobRepository.acquireLock(
      jobProps.id,
      workerId,
      lockUntil
    );

    if (locked) {
      job.moveToActive(workerId, lockUntil);
      await this.jobRepository.update(job);
      this.eventEmitter.emit("job.active", job);
      return job;
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
    // getJob might come from jobRepository or a core service
    const job = (await this.jobRepository.findById(id)) as JobEntity<P,R> | null;
    if (job && job.getProps().workerId === workerId && job.getProps().status === JobStatus.ACTIVE) {
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
    const job = (await this.jobRepository.findById(id)) as JobEntity<P,R> | null;
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
    const job = (await this.jobRepository.findById(id)) as JobEntity<P,R> | null;
    if (job && job.workerId === workerId) {
      this._handleFailedJobRetryOrPermanentFail(job, error);
      await this.jobRepository.update(job);
      this.eventEmitter.emit("job.failed", job);
    }
  }

  private _handleFailedJobRetryOrPermanentFail(job: JobEntity<P,R>, error: Error): void {
    const jobProps = job.getProps();
    if (jobProps.attemptsMade < job.maxAttempts) {
      const baseDelay = jobProps.options.backoff?.delay || 1000;
      let backoffDelay = baseDelay;
      if (jobProps.options.backoff?.type === "exponential") {
        const currentAttempt = Math.max(1, jobProps.attemptsMade);
        backoffDelay = baseDelay * Math.pow(2, currentAttempt - 1);
      }
      const maxBackoff = jobProps.options.backoff?.maxDelay || 3600000;
      backoffDelay = Math.min(backoffDelay, maxBackoff);
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
    const job = (await this.jobRepository.findById(id)) as JobEntity<P,R> | null;
    if (job && job.workerId === workerId) {
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
    const job = (await this.jobRepository.findById(id)) as JobEntity<P,R> | null;
    if (job && job.workerId === workerId) {
      job.addLog(message, level);
      await this.jobRepository.update(job);
      this.eventEmitter.emit("job.log", job);
    }
  }
}
