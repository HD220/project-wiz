// src_refactored/core/domain/job/job.entity.ts
import { AbstractEntity, EntityProps } from '@/core/common/base.entity';

import { ValueError } from '@/domain/common/errors';

import { ActivityHistory } from './job-processing.types'; // Added
import { ExecutionHistoryEntry } from './job-processing.types'; // Added
import { IJobRepository } from './ports/job-repository.interface';
import { JobExecutionLogEntryProps, JobExecutionLogEntryVO } from './value-objects/job-execution-log-entry.vo';
import { JobExecutionLogsVO } from './value-objects/job-execution-logs.vo';
import { JobIdVO } from './value-objects/job-id.vo';
import { JobOptionsVO, IJobOptions } from './value-objects/job-options.vo';
import { JobPriorityVO } from './value-objects/job-priority.vo';
import { JobProgressVO, JobProgressData } from './value-objects/job-progress.vo';
import { JobStatusVO, JobStatusEnum } from './value-objects/job-status.vo';

interface IForwardDeclaredJobEventEmitter {
  // emit(event: string, payload: any): boolean;
}

export interface AgentState { // Defined AgentState type
  conversationHistory: ActivityHistory;
  executionHistory: ExecutionHistoryEntry[];
}

export interface JobEntityConstructionProps<TData = unknown> {
  id?: string | JobIdVO;
  queueName: string;
  jobName: string;
  payload: TData;
  opts?: IJobOptions;
  agentState?: AgentState; // Optional initial agent state
}

export interface JobEntityProps<TData = unknown, TResult = unknown> extends EntityProps<JobIdVO> {
  queueName: string;
  jobName: string;
  payload: Readonly<TData>; // This is the primary job input, distinct from agentState
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
  agentState?: AgentState; // Persisted agent state

  _repository?: IJobRepository;
  _eventEmitter?: IForwardDeclaredJobEventEmitter;
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
    // Payload can be anything, including undefined if the job type doesn't require it
    // However, the GenericAgentExecutor expects AgentExecutionPayload.
    // This create method is generic.

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
      agentState: constructProps.agentState || { // Initialize agentState
        conversationHistory: ActivityHistory.create([]),
        executionHistory: [],
      },
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
    // Ensure agentState is properly rehydrated if it contains VOs
    // Ensure agentState and its conversationHistory are properly rehydrated
    if (props.agentState && props.agentState.conversationHistory) {
        // Assuming props.agentState.conversationHistory from DB is ActivityHistoryEntryProps[]
        // The create method of ActivityHistory now handles this.
        props.agentState.conversationHistory = ActivityHistory.create(
            props.agentState.conversationHistory as unknown as ActivityHistoryEntryProps[]
        );
    } else {
      // Ensure agentState and its components are initialized if not present from DB
      props.agentState = {
        conversationHistory: ActivityHistory.create([]),
        executionHistory: props.agentState?.executionHistory || [], // Preserve executionHistory if only conversationHistory was missing
      };
    }

    return new JobEntity<D, R>(props);
  }

  public _setActiveContext(
    repository: IJobRepository,
    _eventEmitter?: IForwardDeclaredJobEventEmitter,
  ): void {
    this.props._repository = repository;
    this.props._eventEmitter = _eventEmitter;
  }

  public _clearActiveContext(): void {
    this.props._repository = undefined;
    this.props._eventEmitter = undefined;
  }

  get queueName(): string { return this.props.queueName; }
  get jobName(): string { return this.props.jobName; }
  get payload(): Readonly<TData> { return this.props.payload; } // This is the primary input
  get agentState(): AgentState | undefined { return this.props.agentState; } // Getter for agentState

  // Method to update agentState
  public setAgentState(newAgentState: AgentState): void {
    this.props.agentState = newAgentState;
    this.touch();
    // Consider if saving should happen here or be managed by the executor/worker
    // If this is called frequently, immediate save might be too much.
    // For now, it just updates in-memory state. Worker will save the whole job.
  }


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

  public setProgress(progressData: JobProgressData): void {
    this.props.progress = JobProgressVO.create(progressData);
    this.touch();
  }

  public addLog(message: string, level: JobExecutionLogEntryProps['level'] = 'INFO', details?: Record<string, unknown>): void {
    const newLogEntry = JobExecutionLogEntryVO.create(message, level, details, new Date());
    this.props.executionLogs = this.props.executionLogs.addEntry(newLogEntry);
    this.touch();
  }

  public async updateProgress(progressData: JobProgressData): Promise<void> {
    this.setProgress(progressData);
    if (this.props._repository) {
      const saveResult = await this.props._repository.save(this);
      if (saveResult.isError()) {
        console.error(`Job ${this.id.value}: Failed to save progress to repository`, saveResult.error);
      }
    } else {
      console.warn(`Job ${this.id.value}: updateProgress called without active repository context. State updated in memory only.`);
    }
  }

  public async addLogToExecution(message: string, level: JobExecutionLogEntryProps['level'] = 'INFO', details?: Record<string, unknown>): Promise<void> {
    this.addLog(message, level, details);
    if (this.props._repository) {
      const saveResult = await this.props._repository.save(this);
       if (saveResult.isError()) {
        console.error(`Job ${this.id.value}: Failed to save log to repository`, saveResult.error);
      }
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
