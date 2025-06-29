// src_refactored/core/domain/job/job.entity.ts
import { AbstractEntity } from '@/core/common/base.entity';
import { DomainError } from '@/core/domain/common/errors';

import { JobIdVO } from './value-objects/job-id.vo';
import { IJobOptions, JobOptionsVO } from './value-objects/job-options.vo';

export enum JobStatus {
  WAITING = 'waiting',   // Job is waiting in the queue to be processed
  ACTIVE = 'active',     // Job is currently being processed by a worker
  COMPLETED = 'completed', // Job has been processed successfully
  FAILED = 'failed',     // Job has failed after all attempts
  DELAYED = 'delayed',   // Job is scheduled to be processed at a later time
  PAUSED = 'paused',     // Queue is paused, job will not be processed until resumed
  // TODO: Consider STALLED if we implement active lock expiration checks.
}

export interface JobLogEntry {
  message: string;
  level: string; // e.g., INFO, ERROR, DEBUG
  timestamp: Date;
}

export interface JobEntityProps<P = unknown, R = unknown> {
  id: JobIdVO;
  queueName: string;
  name: string; // Name of the job (e.g., 'sendWelcomeEmail')
  payload: P;
  options: JobOptionsVO;
  status: JobStatus;
  attemptsMade: number;
  progress: number | object; // Can be a percentage (0-100) or an object
  logs: JobLogEntry[];
  createdAt: Date;
  updatedAt: Date; // Timestamp of the last update to the job
  processedOn?: Date; // Timestamp when processing started for the last attempt
  finishedOn?: Date; // Timestamp when the job finally completed or failed
  delayUntil?: Date; // If status is DELAYED, this is when it should become WAITING
  lockUntil?: Date; // If status is ACTIVE, worker holds a lock until this time
  workerId?: string; // ID of the worker currently processing/locking the job
  returnValue?: R; // Result of a successfully completed job
  failedReason?: string; // Error message if the job failed
  stacktrace?: string[]; // Stacktrace if the job failed
  // parentId?: JobIdVO; // For job dependencies/flows - future
}

export class JobEntity<P = unknown, R = unknown> extends AbstractEntity<JobIdVO, JobEntityProps<P, R>> {
  private _progressChanged: boolean = false;
  private _logsChanged: boolean = false;

  private constructor(props: JobEntityProps<P, R>) {
    super(props);
  }

  public static create<P, R>(
    params: {
      id?: JobIdVO;
      queueName: string;
      name: string;
      payload: P;
      options?: IJobOptions; // Accepts raw options, will be converted to VO
    },
  ): JobEntity<P, R> {
    const jobId = params.id || JobIdVO.create();
    const jobOptions = JobOptionsVO.create(params.options);
    const now = new Date();

    const props: JobEntityProps<P, R> = {
      id: jobId,
      queueName: params.queueName,
      name: params.name,
      payload: params.payload,
      options: jobOptions,
      status: jobOptions.delay && jobOptions.delay > 0 ? JobStatus.DELAYED : JobStatus.WAITING,
      attemptsMade: 0,
      progress: 0,
      logs: [],
      createdAt: now,
      updatedAt: now,
      delayUntil: jobOptions.delay && jobOptions.delay > 0 ? new Date(now.getTime() + jobOptions.delay) : undefined,
    };
    return new JobEntity<P, R>(props);
  }

  // This is the single, corrected fromPersistence method
  public static fromPersistence<P, R>(
    persistedData: Omit<JobEntityProps<P,R>, 'id'|'options'|'logs'|'createdAt'|'updatedAt'|'processedOn'|'finishedOn'|'delayUntil'|'lockUntil'> &
                  { id: string; options: IJobOptions; logs: Array<{message: string, level: string, timestamp: number}>; createdAt: number; updatedAt: number; processedOn?: number; finishedOn?: number; delayUntil?: number; lockUntil?: number; }
  ): JobEntity<P, R> {
    const propsWithVOOptions: JobEntityProps<P, R> = {
        ...persistedData, // Spread first
        id: JobIdVO.create(persistedData.id), // Create VO from string id
        options: JobOptionsVO.create(persistedData.options), // Create VO from raw options
        // Ensure dates are Date objects
        createdAt: new Date(persistedData.createdAt),
        updatedAt: new Date(persistedData.updatedAt),
        processedOn: persistedData.processedOn ? new Date(persistedData.processedOn) : undefined,
        finishedOn: persistedData.finishedOn ? new Date(persistedData.finishedOn) : undefined,
        delayUntil: persistedData.delayUntil ? new Date(persistedData.delayUntil) : undefined,
        lockUntil: persistedData.lockUntil ? new Date(persistedData.lockUntil) : undefined,
        logs: persistedData.logs ? persistedData.logs.map(logEntry => ({...logEntry, timestamp: new Date(logEntry.timestamp)})) : [],
    };
    return new JobEntity<P, R>(propsWithVOOptions);
  }

  // Removed the first fromPersistence method and the JobPersistenceLoadPropsType getter.

  get id(): JobIdVO { return this.props.id; }
  get queueName(): string { return this.props.queueName; }
  get name(): string { return this.props.name; }
  get payload(): P { return this.props.payload; }
  get options(): JobOptionsVO { return this.props.options; }
  get status(): JobStatus { return this.props.status; }
  get attemptsMade(): number { return this.props.attemptsMade; }
  get maxAttempts(): number { return this.props.options.attempts; }
  get progress(): number | object { return this.props.progress; }
  get logs(): ReadonlyArray<JobLogEntry> { return this.props.logs; }
  get createdAt(): Date { return this.props.createdAt; }
  get updatedAt(): Date { return this.props.updatedAt; }
  get processedOn(): Date | undefined { return this.props.processedOn; }
  get finishedOn(): Date | undefined { return this.props.finishedOn; }
  get delayUntil(): Date | undefined { return this.props.delayUntil; }
  get lockUntil(): Date | undefined { return this.props.lockUntil; }
  get workerId(): string | undefined { return this.props.workerId; }
  get returnValue(): R | undefined { return this.props.returnValue; }
  get failedReason(): string | undefined { return this.props.failedReason; }
  get stacktrace(): string[] | undefined { return this.props.stacktrace; }

  get isRetry(): boolean {
    // A job is considered a retry if it's being attempted more than once.
    // attemptsMade is incremented just before an attempt starts (in moveToActive).
    // So, if attemptsMade > 1, it's a retry.
    // If it's WAITING/DELAYED and attemptsMade > 0, it means it has failed before and is pending retry.
    if (this.props.status === JobStatus.ACTIVE) {
      return this.props.attemptsMade > 1;
    }
    return this.props.attemptsMade > 0 &&
           (this.props.status === JobStatus.WAITING || this.props.status === JobStatus.DELAYED) &&
           this.props.failedReason !== undefined;
  }

  get progressChanged(): boolean { return this._progressChanged; }
  get logsChanged(): boolean { return this._logsChanged; }

  public updateProgress(progress: number | object): void {
    if (this.status === JobStatus.COMPLETED || this.status === JobStatus.FAILED) {
      console.warn(`[JobEntity] Cannot update progress for job ${this.id.value} as it is already in status ${this.status}.`);
      return;
    }
    this.props.progress = progress;
    this.props.updatedAt = new Date();
    this._progressChanged = true; // Though this flag is not currently used by repo for partial updates
  }

  public addLog(message: string, level: string = 'INFO'): void {
    // Allow adding logs even after completion/failure for audit purposes.
    // if (this.status === JobStatus.COMPLETED || this.status === JobStatus.FAILED) {
    //   console.warn(`[JobEntity] Adding log to job ${this.id.value} which is already in status ${this.status}.`);
    // }
    this.props.logs.push({ message, level, timestamp: new Date() });
    this.props.updatedAt = new Date();
    this._logsChanged = true;
  }

  public clearChangeFlags(): void {
    this._progressChanged = false;
    this._logsChanged = false;
  }

  // --- Methods to be called by QueueService/WorkerService to manage lifecycle ---

  public moveToActive(workerId: string, lockUntil: Date): void {
    if (this.status !== JobStatus.WAITING && this.status !== JobStatus.PAUSED && this.status !== JobStatus.DELAYED) {
      // DELAYED jobs become WAITING first, then ACTIVE. This check might be redundant if StalledJobManager handles it.
      // Or if fetchNextJob in QueueService correctly filters only WAITING.
      throw new DomainError(`Job ${this.id.value} cannot be moved to active from status ${this.status}`);
    }
    this.props.status = JobStatus.ACTIVE;
    this.props.workerId = workerId;
    this.props.lockUntil = lockUntil;
    this.props.processedOn = new Date(); // Mark start of this processing attempt
    this.props.updatedAt = new Date();
    this.props.attemptsMade += 1;
  }

  public extendLock(newLockUntil: Date, workerId: string): void {
    if (this.props.status !== JobStatus.ACTIVE || this.props.workerId !== workerId) {
      throw new DomainError(`Cannot extend lock for job ${this.id.value}: not active by worker ${workerId}.`);
    }
    this.props.lockUntil = newLockUntil;
    this.props.updatedAt = new Date();
  }

  public markAsCompleted(returnValue: R): void {
    if (this.props.status !== JobStatus.ACTIVE) {
      // This might happen if a job is marked as stalled and then the original worker tries to complete it.
      // Or if it's already completed/failed.
      // Log a warning, or decide on a stricter policy.
      console.warn(`Job ${this.id.value} attempted to complete but was not in ACTIVE state (current: ${this.props.status}).`);
      // For now, we'll allow it to proceed to ensure the final state is captured if possible,
      // but the repository should handle potential race conditions if status changed.
    }
    this.props.status = JobStatus.COMPLETED;
    this.props.returnValue = returnValue;
    this.props.finishedOn = new Date();
    this.props.updatedAt = this.props.finishedOn;
    this.props.failedReason = undefined;
    this.props.stacktrace = undefined;
    this.props.lockUntil = undefined;
    this.props.workerId = undefined;
  }

  public markAsFailed(reason: string, stacktrace?: string[]): void {
     if (this.props.status !== JobStatus.ACTIVE) {
      console.warn(`Job ${this.id.value} attempted to fail but was not in ACTIVE state (current: ${this.props.status}).`);
    }
    this.props.status = JobStatus.FAILED;
    this.props.failedReason = reason;
    this.props.stacktrace = stacktrace;
    this.props.finishedOn = new Date();
    this.props.updatedAt = this.props.finishedOn;
    this.props.lockUntil = undefined;
    this.props.workerId = undefined;
  }

  public moveToDelayed(delayUntil: Date, originalError?: Error): void {
    // This is typically called after a failed attempt if retries are remaining
    this.props.status = JobStatus.DELAYED;
    this.props.delayUntil = delayUntil;
    this.props.updatedAt = new Date();
    this.props.processedOn = undefined; // Reset for the next attempt
    this.props.lockUntil = undefined;
    this.props.workerId = undefined;
    if (originalError) {
        this.props.failedReason = originalError.message; // Keep last error reason for the delay
        // Do not clear stacktrace yet, it might be useful for the final failure
    }
  }

  public moveToWaiting(): void {
    // Called when a delayed job is ready or a stalled job is re-queued
    if (this.status !== JobStatus.DELAYED && this.status !== JobStatus.PAUSED /* && this.status !== JobStatus.STALLED - if we add it */) {
        // Potentially log a warning if moving from an unexpected state
    }
    this.props.status = JobStatus.WAITING;
    this.props.delayUntil = undefined;
    this.props.processedOn = undefined;
    this.props.updatedAt = new Date();
    this.props.lockUntil = undefined;
    this.props.workerId = undefined;
  }

  public markAsStalled(_maxAttemptsForStalled?: number): boolean { // Returns true if it should be failed permanently
    // _maxAttemptsForStalled might be used by the caller (StalledJobsManager) to decide the next step,
    // but the entity itself primarily records the event.
    this.addLog(`Job marked as stalled (worker: ${this.props.workerId}, lock expired: ${this.props.lockUntil})`, 'WARN');
    this.props.lockUntil = undefined;
    this.props.workerId = undefined; // Release the worker
    this.props.processedOn = undefined; // Reset for next attempt
    this.props.updatedAt = new Date();

    if (this.props.attemptsMade >= this.maxAttempts) {
        this.props.status = JobStatus.FAILED;
        this.props.failedReason = this.props.failedReason || 'Job failed after becoming stalled and exceeding max attempts.';
        this.props.finishedOn = new Date();
        return true; // Should be marked as FAILED
    }
    // If not, it will be moved to WAITING or DELAYED by the StalledJobsManager
    // For now, the StalledJobsManager will decide the next state (WAITING or DELAYED if backoff applies)
    return false;
  }

  public pause(): void {
    if (this.status === JobStatus.WAITING || this.status === JobStatus.DELAYED) {
      this.props.status = JobStatus.PAUSED;
      this.props.updatedAt = new Date();
    } else {
      throw new DomainError(`Cannot pause job ${this.id.value} in status ${this.status}.`);
    }
  }

  public resume(): void {
    if (this.props.status === JobStatus.PAUSED) {
      this.props.status = this.props.delayUntil && this.props.delayUntil > new Date() ? JobStatus.DELAYED : JobStatus.WAITING;
      this.props.updatedAt = new Date();
    } else {
      throw new DomainError(`Cannot resume job ${this.id.value} in status ${this.status}.`);
    }
  }

  // Removed the JobPersistenceSavePropsType getter.
  public toPersistence(): {
      id: string; queueName: string; name: string; payload: P; options: IJobOptions;
      status: JobStatus; attemptsMade: number; progress: number | object;
      logs: Array<{ message: string; level: string; timestamp: number }>; // Log timestamps are numbers for JSON
      createdAt: Date; updatedAt: Date; priority: number; // Core dates are Date objects
      processedOn?: Date; finishedOn?: Date; delayUntil?: Date; lockUntil?: Date; // Optional dates are Date objects
      workerId?: string; returnValue?: R; failedReason?: string; stacktrace?: string[];
    } {
    return {
      id: this.props.id.value,
      queueName: this.props.queueName,
      name: this.props.name,
      payload: this.props.payload,
      options: this.props.options.toPersistence(), // This is IJobOptions
      status: this.props.status,
      attemptsMade: this.props.attemptsMade,
      progress: this.props.progress,
      logs: this.props.logs.map(logEntry => ({ // Log timestamps are numbers for JSON
        ...logEntry,
        timestamp: logEntry.timestamp.getTime(),
      })),
      createdAt: this.props.createdAt, // Pass Date object
      updatedAt: this.props.updatedAt, // Pass Date object
      priority: this.props.options.priority,

      // Optional fields: Pass Date objects directly
      ...(this.props.processedOn && { processedOn: this.props.processedOn }),
      ...(this.props.finishedOn && { finishedOn: this.props.finishedOn }),
      ...(this.props.delayUntil && { delayUntil: this.props.delayUntil }),
      ...(this.props.lockUntil && { lockUntil: this.props.lockUntil }),
      ...(this.props.workerId && { workerId: this.props.workerId }),
      ...(this.props.returnValue !== undefined && { returnValue: this.props.returnValue }),
      ...(this.props.failedReason && { failedReason: this.props.failedReason }),
      ...(this.props.stacktrace && { stacktrace: this.props.stacktrace }),
    };
  }
}
