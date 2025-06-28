// src_refactored/core/domain/job/job.entity.ts
import { AbstractEntity, EntityProps } from '@/core/common/base.entity';

import { ValueError } from '@/domain/common/errors'; // DomainError removed as it's unused

import { JobExecutionLogEntryProps } from './value-objects/job-execution-log-entry.vo';
import { JobExecutionLogsVO } from './value-objects/job-execution-logs.vo';
import { JobIdVO } from './value-objects/job-id.vo';
// RetryStrategyOptions and RepeatOptions are part of IJobOptions, so they are used indirectly.
// Linter might not pick this up if IJobOptions is not destructured in a way that shows their usage here.
// However, they are essential for the structure of JobOptionsVO.
import { JobOptionsVO, IJobOptions } from './value-objects/job-options.vo';
import { JobPriorityVO } from './value-objects/job-priority.vo';
import { JobProgressVO, JobProgressData } from './value-objects/job-progress.vo';
import { JobStatusVO, JobStatusEnum } from './value-objects/job-status.vo';


// Interface for properties required to construct a JobEntity
export interface JobEntityConstructionProps<TData = unknown> { // Changed any to unknown
  id?: string | JobIdVO;
  queueName: string;
  jobName: string;
  payload: TData;
  opts?: IJobOptions;
}

// Interface for the internal state of JobEntity
export interface JobEntityProps<TData = unknown, TResult = unknown> extends EntityProps<JobIdVO> { // Changed any to unknown
  queueName: string;
  jobName: string;
  payload: Readonly<TData>;
  opts: JobOptionsVO;

  status: JobStatusVO;
  priority: JobPriorityVO;

  progress: JobProgressVO;
  returnValue?: Readonly<TResult>;
  failedReason?: string;

  attemptsMade: number;

  createdAt: number;
  updatedAt: number;
  processAt?: number;
  startedAt?: number;
  finishedAt?: number;

  executionLogs: JobExecutionLogsVO;

  lockedByWorkerId?: string;
  lockExpiresAt?: number;

  repeatJobKey?: string;
}

export class JobEntity<TData = unknown, TResult = unknown> extends AbstractEntity<JobIdVO, JobEntityProps<TData, TResult>> { // Changed any to unknown
  private constructor(props: JobEntityProps<TData, TResult>) {
    super(props);
  }

  public static create<D = unknown, R = unknown>( // Changed any to unknown
    constructProps: JobEntityConstructionProps<D>,
  ): JobEntity<D, R> {
    if (!constructProps.queueName || constructProps.queueName.trim() === '') {
      throw new ValueError('Job creation requires a queueName.');
    }
    if (!constructProps.jobName || constructProps.jobName.trim() === '') {
      throw new ValueError('Job creation requires a jobName.');
    }
    if (constructProps.payload === undefined) {
      throw new ValueError('Job creation requires a payload.');
    }

    const id = constructProps.id instanceof JobIdVO ? constructProps.id : JobIdVO.create(constructProps.id);
    const jobOptions = JobOptionsVO.create(constructProps.opts);
    const nowMs = Date.now();

    let initialStatus = JobStatusVO.pending();
    let processAt: number | undefined = undefined;
    if (jobOptions.delay > 0) {
      initialStatus = JobStatusVO.delayed();
      processAt = nowMs + jobOptions.delay;
    }

    const props: JobEntityProps<D, R> = {
      id,
      queueName: constructProps.queueName,
      jobName: constructProps.jobName,
      payload: Object.freeze(constructProps.payload) as Readonly<D>, // Ensure payload is immutable
      opts: jobOptions,
      status: initialStatus,
      priority: JobPriorityVO.create(jobOptions.priority),
      progress: JobProgressVO.initial(),
      attemptsMade: 0,
      createdAt: nowMs,
      updatedAt: nowMs,
      processAt: processAt,
      executionLogs: JobExecutionLogsVO.empty(),
    };

    return new JobEntity<D, R>(props);
  }

  /**
   * Rehydrates a JobEntity from persistence.
   * This method is intended for use by repositories.
   * It bypasses some of the creation logic (like default status setting based on delay)
   * as the persisted props already reflect the job's state.
   */
  public static fromPersistence<D = any, R = any>(
    props: JobEntityProps<D, R>,
  ): JobEntity<D, R> {
    // Basic validation: ensure ID and critical VOs are valid instances.
    // Repositories are responsible for ensuring the props are valid structurally.
    if (!(props.id instanceof JobIdVO)) {
      throw new ValueError('Cannot rehydrate JobEntity without a valid JobIdVO instance for id.');
    }
    if (!(props.opts instanceof JobOptionsVO)) {
      throw new ValueError('Cannot rehydrate JobEntity without a valid JobOptionsVO instance for opts.');
    }
    if (!(props.status instanceof JobStatusVO)) {
      throw new ValueError('Cannot rehydrate JobEntity without a valid JobStatusVO instance for status.');
    }
    // Add other critical VO checks if necessary (priority, progress, executionLogs)

    return new JobEntity<D, R>(props);
  }

  // --- Accessors ---
  get queueName(): string { return this.props.queueName; }
  get jobName(): string { return this.props.jobName; }
  get payload(): Readonly<TData> { return this.props.payload; }
  get opts(): JobOptionsVO { return this.props.opts; }
  get status(): JobStatusVO { return this.props.status; }
  get priority(): JobPriorityVO { return this.props.priority; }
  get progress(): JobProgressVO { return this.props.progress; }
  get returnValue(): Readonly<TResult> | undefined { return this.props.returnValue; }
  get failedReason(): string | undefined { return this.props.failedReason; }
  get attemptsMade(): number { return this.props.attemptsMade; }
  get maxAttempts(): number { return this.opts.attempts; } // From JobOptionsVO

  get createdAt(): Date { return new Date(this.props.createdAt); }
  get updatedAt(): Date { return new Date(this.props.updatedAt); }
  get processAt(): Date | undefined { return this.props.processAt ? new Date(this.props.processAt) : undefined; }
  get startedAt(): Date | undefined { return this.props.startedAt ? new Date(this.props.startedAt) : undefined; }
  get finishedAt(): Date | undefined { return this.props.finishedAt ? new Date(this.props.finishedAt) : undefined; }

  get executionLogs(): JobExecutionLogsVO { return this.props.executionLogs; }
  get lockedByWorkerId(): string | undefined { return this.props.lockedByWorkerId; }
  get lockExpiresAt(): Date | undefined { return this.props.lockExpiresAt ? new Date(this.props.lockExpiresAt) : undefined; }
  get repeatJobKey(): string | undefined { return this.props.repeatJobKey; }


  // --- Mutators (internal state changes, persistence handled by repository) ---

  private touch(): void {
    this.props.updatedAt = Date.now();
  }

  public setProgress(progressData: JobProgressData): void {
    this.props.progress = JobProgressVO.create(progressData);
    this.touch();
    // Event 'job.progress' should be emitted by the service calling this, after saving.
  }

  public addLog(message: string, level: JobExecutionLogEntryProps['level'] = 'INFO', details?: Record<string, unknown>): void { // Changed any to unknown
    this.props.executionLogs = this.props.executionLogs.addLog(message, level, details);
    this.touch();
    // Event 'job.log_added' should be emitted by the service calling this, after saving.
  }

  // --- State Transition Methods ---
  // These methods only update the in-memory state of the entity.
  // The repository is responsible for persisting these changes atomically.

  public moveToActive(workerId: string, lockDurationMs: number): boolean {
    if (!this.status.is(JobStatusEnum.PENDING) && !this.status.is(JobStatusEnum.DELAYED)) {
      // DELAYED jobs should be promoted to PENDING by scheduler first
      console.warn(`Job ${this.id.value} cannot be moved to ACTIVE from status ${this.status.value}`);
      return false;
    }
    this.props.status = JobStatusVO.active();
    this.props.attemptsMade += 1;
    this.props.startedAt = Date.now();
    this.props.lockedByWorkerId = workerId;
    this.props.lockExpiresAt = Date.now() + lockDurationMs;
    this.touch();
    return true;
  }

  public renewLock(newLockExpiresAtMs: number, workerId: string): boolean {
    if (!this.status.is(JobStatusEnum.ACTIVE) || this.props.lockedByWorkerId !== workerId) {
      console.warn(`Job ${this.id.value} lock cannot be renewed. Status: ${this.status.value}, LockedBy: ${this.props.lockedByWorkerId}`);
      return false;
    }
    this.props.lockExpiresAt = newLockExpiresAtMs;
    this.touch();
    return true;
  }

  public moveToCompleted(resultValue: TResult): boolean {
    if (!this.status.is(JobStatusEnum.ACTIVE)) {
      // Potentially log warning if trying to complete a non-active job
      return false;
    }
    this.props.status = JobStatusVO.completed();
    this.props.returnValue = Object.freeze(resultValue) as Readonly<TResult>;
    this.props.finishedAt = Date.now();
    this.props.progress = JobProgressVO.create(100); // Mark as 100% on completion
    this.clearLock();
    this.touch();
    return true;
  }

  private clearLock(): void {
    this.props.lockedByWorkerId = undefined;
    this.props.lockExpiresAt = undefined;
  }

  public moveToFailed(reason: string): boolean {
     if (this.status.isTerminal()) return false; // Already completed or failed

    this.props.status = JobStatusVO.failed();
    this.props.failedReason = reason;
    this.props.finishedAt = Date.now();
    this.clearLock();
    this.touch();
    return true;
  }

  public moveToDelayed(newProcessAtMs: number): boolean {
    if (this.status.isTerminal()) return false;

    this.props.status = JobStatusVO.delayed();
    this.props.processAt = newProcessAtMs;
    this.clearLock(); // If it was active and is being re-delayed for retry
    this.touch();
    return true;
  }

  public promoteToPending(): boolean {
    if (!this.status.is(JobStatusEnum.DELAYED) && !this.status.is(JobStatusEnum.WAITING_CHILDREN)) {
      // Only DELAYED or WAITING_CHILDREN jobs can be directly promoted to PENDING by scheduler
      return false;
    }
    this.props.status = JobStatusVO.pending();
    this.props.processAt = undefined; // Clear processAt if it was delayed
    this.touch();
    return true;
  }

  public isProcessable(currentTimeMs: number = Date.now()): boolean {
    return this.status.is(JobStatusEnum.PENDING) &&
           (!this.props.processAt || this.props.processAt <= currentTimeMs);
  }
}
