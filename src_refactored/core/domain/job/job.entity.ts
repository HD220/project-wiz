// src_refactored/core/domain/job/job.entity.ts
import { AbstractEntity, EntityProps } from '@/core/common/base.entity';
import { ValueError } from '@/domain/common/errors';
import { IJobRepository } from './ports/job-repository.interface';

// Removed IJobEventEmitter and application event payload imports from here

import { JobExecutionLogEntryProps, JobExecutionLogEntryVO } from './value-objects/job-execution-log-entry.vo';
import { JobExecutionLogsVO } from './value-objects/job-execution-logs.vo';
import { JobIdVO } from './value-objects/job-id.vo';
import { JobOptionsVO, IJobOptions } from './value-objects/job-options.vo';
import { JobPriorityVO } from './value-objects/job-priority.vo';
import { JobProgressVO, JobProgressData } from './value-objects/job-progress.vo';
import { JobStatusVO, JobStatusEnum } from './value-objects/job-status.vo';

// Forward declare IJobEventEmitter to satisfy _setActiveContext signature if needed by other parts,
// but JobEntity itself will not use it to emit.
interface IForwardDeclaredJobEventEmitter {
  // emit(event: string, payload: any): boolean; // Not strictly needed if entity won't emit
}


export interface JobEntityConstructionProps<TData = unknown> {
  id?: string | JobIdVO;
  queueName: string;
  jobName: string;
  payload: TData;
  opts?: IJobOptions;
}

export interface JobEntityProps<TData = unknown, TResult = unknown> extends EntityProps<JobIdVO> {
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

  _repository?: IJobRepository;
  _eventEmitter?: IForwardDeclaredJobEventEmitter; // Kept for signature, but won't be used by entity to emit
}

export class JobEntity<TData = unknown, TResult = unknown> extends AbstractEntity<JobIdVO, JobEntityProps<TData, TResult>> {

  public constructor(props: JobEntityProps<TData, TResult>) {
    super(props);
  }

  public static create<D = unknown, R = unknown>(
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
      payload: Object.freeze(constructProps.payload) as Readonly<D>,
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

  public static fromPersistence<D = unknown, R = unknown>(
    props: JobEntityProps<D, R>,
  ): JobEntity<D, R> {
    if (!(props.id instanceof JobIdVO)) {
      throw new ValueError('Cannot rehydrate JobEntity without a valid JobIdVO instance for id.');
    }
    if (!(props.opts instanceof JobOptionsVO)) {
      throw new ValueError('Cannot rehydrate JobEntity without a valid JobOptionsVO instance for opts.');
    }
    if (!(props.status instanceof JobStatusVO)) {
      throw new ValueError('Cannot rehydrate JobEntity without a valid JobStatusVO instance for status.');
    }
    return new JobEntity<D, R>(props);
  }

  public _setActiveContext(
    repository: IJobRepository,
    _eventEmitter?: IForwardDeclaredJobEventEmitter, // Emitter no longer used by entity for its methods
  ): void {
    this.props._repository = repository;
    this.props._eventEmitter = _eventEmitter; // Store it, but internal methods won't use it to emit.
  }

  public _clearActiveContext(): void {
    this.props._repository = undefined;
    this.props._eventEmitter = undefined;
  }

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
  get maxAttempts(): number { return this.opts.attempts; }

  get createdAt(): Date { return new Date(this.props.createdAt); }
  get updatedAt(): Date { return new Date(this.props.updatedAt); }
  get processAt(): Date | undefined { return this.props.processAt ? new Date(this.props.processAt) : undefined; }
  get startedAt(): Date | undefined { return this.props.startedAt ? new Date(this.props.startedAt) : undefined; }
  get finishedAt(): Date | undefined { return this.props.finishedAt ? new Date(this.props.finishedAt) : undefined; }

  get executionLogs(): JobExecutionLogsVO { return this.props.executionLogs; }
  get lockedByWorkerId(): string | undefined { return this.props.lockedByWorkerId; }
  get lockExpiresAt(): Date | undefined { return this.props.lockExpiresAt ? new Date(this.props.lockExpiresAt) : undefined; }
  get repeatJobKey(): string | undefined { return this.props.repeatJobKey; }

  private touch(): void {
    this.props.updatedAt = Date.now();
  }

  // Synchronous state update methods
  public setProgress(progressData: JobProgressData): void { // Renamed from setProgressInternal
    this.props.progress = JobProgressVO.create(progressData);
    this.touch();
  }

  public addLog(message: string, level: JobExecutionLogEntryProps['level'] = 'INFO', details?: Record<string, unknown>): void { // Renamed from addLogInternal
    const newLogEntry = JobExecutionLogEntryVO.create(message, level, details, new Date());
    this.props.executionLogs = this.props.executionLogs.addEntry(newLogEntry);
    this.touch();
  }

  // Async methods for processor interaction that require persistence
  public async updateProgress(progressData: JobProgressData): Promise<void> {
    this.setProgress(progressData); // Use the public synchronous version
    if (this.props._repository) {
      const saveResult = await this.props._repository.save(this);
      if (saveResult.isError()) {
        console.error(`Job ${this.id.value}: Failed to save progress to repository`, saveResult.error);
        // Consider how to propagate this error if critical for the processor
      }
      // Event emission for 'job.progress' will be handled by JobWorkerService if needed after this call.
    } else {
      console.warn(`Job ${this.id.value}: updateProgress called without active repository context. State updated in memory only.`);
    }
  }

  public async addLogToExecution(message: string, level: JobExecutionLogEntryProps['level'] = 'INFO', details?: Record<string, unknown>): Promise<void> {
    this.addLog(message, level, details); // Use the public synchronous version
    if (this.props._repository) {
      const saveResult = await this.props._repository.save(this);
       if (saveResult.isError()) {
        console.error(`Job ${this.id.value}: Failed to save log to repository`, saveResult.error);
      }
      // Event emission for 'job.log_added' will be handled by JobWorkerService if needed.
    } else {
       console.warn(`Job ${this.id.value}: addLogToExecution called without active repository context. State updated in memory only.`);
    }
  }

  public moveToActive(workerId: string, lockDurationMs: number): boolean {
    if (!this.status.is(JobStatusEnum.PENDING) && !this.status.is(JobStatusEnum.DELAYED)) {
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
      return false;
    }
    this.props.status = JobStatusVO.completed();
    this.props.returnValue = Object.freeze(resultValue) as Readonly<TResult>;
    this.props.finishedAt = Date.now();
    this.props.progress = JobProgressVO.create(100);
    this.clearLock();
    this.touch();
    return true;
  }

  private clearLock(): void {
    this.props.lockedByWorkerId = undefined;
    this.props.lockExpiresAt = undefined;
    this._clearActiveContext();
  }

  public moveToFailed(reason: string): boolean {
     if (this.status.isTerminal()) return false;

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
    this.clearLock();
    this.touch();
    return true;
  }

  public promoteToPending(): boolean {
    if (!this.status.is(JobStatusEnum.DELAYED) && !this.status.is(JobStatusEnum.WAITING_CHILDREN)) {
      return false;
    }
    this.props.status = JobStatusVO.pending();
    this.props.processAt = undefined;
    this.touch();
    return true;
  }

  public isProcessable(currentTimeMs: number = Date.now()): boolean {
    return this.status.is(JobStatusEnum.PENDING) &&
           (!this.props.processAt || this.props.processAt <= currentTimeMs);
  }
}
