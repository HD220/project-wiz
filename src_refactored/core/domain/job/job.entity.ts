import { AbstractEntity, EntityProps } from "@/core/common/base.entity";

import { EntityError } from "@/domain/common/errors";

import { ExecutionHistoryEntry } from "./job-processing.types";
import { JobStateMutator } from "./job-state.mutator";
import { JobFactory } from "./job.factory";
import {
  JobStatus,
  JobEntityProps,
  JobEntityPropsSchema,
} from "./job.types";
import {
  ActivityHistoryVO,
  ActivityHistoryEntryVO,
} from "./value-objects/activity-history.vo";
import { JobIdVO } from "./value-objects/job-id.vo";
import { IJobOptions, JobOptionsVO } from "./value-objects/job-options.vo";



interface InternalJobEntityProps<P, R> extends EntityProps<JobIdVO> {
  queueName: string;
  name: string;
  payload: P;
  options: JobOptionsVO;
  status: JobStatus;
  attemptsMade: number;
  progress: number | object;
  logs: Array<{ message: string; level: string; timestamp: Date }>;
  createdAt: Date;
  updatedAt: Date;
  delayUntil?: Date | null;
  finishedAt?: Date | null;
  processedAt?: Date | null;
  failedReason?: string | null;
  stacktrace?: string[] | null;
  returnValue?: R | null;
  workerId?: string;
  lockUntil?: Date | null;
}

export class JobEntity<P extends { userId?: string }, R = unknown> extends AbstractEntity<
  JobIdVO,
  InternalJobEntityProps<P, R>
> {
  private _progressChanged: boolean = false;
  private _logsChanged: boolean = false;
  private _stateMutator: JobStateMutator<P, R>;

  private constructor(
    props: InternalJobEntityProps<P, R>,
    initialConversationHistory?: ActivityHistoryVO,
    initialExecutionHistory?: ExecutionHistoryEntry[]
  ) {
    super(props);
    this._stateMutator = new JobStateMutator(
      this.props,
      initialConversationHistory,
      initialExecutionHistory
    );
  }

  public static create<P extends { userId?: string }, R>(params: {
    id?: JobIdVO;
    queueName: string;
    name: string;
    payload: P;
    options?: IJobOptions;
  }): JobEntity<P, R> {
    const props = JobFactory.createJobProps(params);

    const validationResult = JobEntityPropsSchema.safeParse(props);
    if (!validationResult.success) {
      throw new EntityError("Invalid JobEntity props.", {
        details: validationResult.error.flatten().fieldErrors,
      });
    }

    return new JobEntity<P, R>(props as InternalJobEntityProps<P, R>, ActivityHistoryVO.create(), []);
  }

  public get finishedAt(): Date | null | undefined { return this.props.finishedAt; }

  get maxAttempts(): number {
    return this.props.options.attempts;
  }

  get isRetry(): boolean {
    if (this.props.status === JobStatus.ACTIVE) {
      return this.props.attemptsMade > 1;
    }
    return (
      this.props.attemptsMade > 0 &&
      (this.props.status === JobStatus.WAITING ||
        this.props.status === JobStatus.DELAYED) &&
      this.props.failedReason !== undefined
    );
  }

  get progressChanged(): boolean {
    return this._progressChanged;
  }
  get logsChanged(): boolean {
    return this._logsChanged;
  }

  public updateProgress(progress: number | object): void {
    if (
      this.props.status === JobStatus.COMPLETED ||
      this.props.status === JobStatus.FAILED
    ) {
      console.warn(`[JobEntity] Cannot update progress for job ${this.props.id.value} as it is already in status ${this.props.status}.`);
      return;
    }
    this.props.progress = progress;
    this.props.updatedAt = new Date();
    this._progressChanged = true;
  }

  public addLog(message: string, level: string = "INFO"): void {
    this.props.logs.push({ message, level, timestamp: new Date() });
    this.props.updatedAt = new Date();
    this._logsChanged = true;
  }

  public clearChangeFlags(): void {
    this._progressChanged = false;
    this._logsChanged = false;
  }

  public moveToActive(workerId: string, lockUntil: Date): void {
    this._stateMutator.moveToActive(workerId, lockUntil);
  }
  public extendLock(newLockUntil: Date, workerId: string): void {
    this._stateMutator.extendLock(newLockUntil, workerId);
  }
  public markAsCompleted(returnValue: R): void {
    this._stateMutator.markAsCompleted(returnValue);
  }
  public markAsFailed(reason: string, stacktrace?: string[]): void {
    this._stateMutator.markAsFailed(reason, stacktrace);
  }
  public moveToDelayed(delayUntil: Date, originalError?: Error): void {
    this._stateMutator.moveToDelayed(delayUntil, originalError);
  }
  public moveToWaiting(): void {
    this._stateMutator.moveToWaiting();
  }

  public markAsStalled(): boolean {
    const shouldFail = this._stateMutator.markAsStalled();
    if (shouldFail) {
      this.addLog(`Job failed after becoming stalled and exceeding max attempts. (worker: ${this.props.workerId}, lock expired: ${this.props.lockUntil})`, "ERROR");
    } else {
      this.addLog(`Job marked as stalled (worker: ${this.props.workerId}, lock expired: ${this.props.lockUntil})`, "WARN");
    }
    return shouldFail;
  }
  public pause(): void {
    this._stateMutator.pause();
  }
  public resume(): void {
    this._stateMutator.resume();
  }

  public get conversationHistory(): ActivityHistoryVO {
    return this._stateMutator.getConversationHistory();
  }

  public addConversationEntry(entry: ActivityHistoryEntryVO): void {
    this._stateMutator.addConversationEntry(entry);
  }

  public getExecutionHistory(): ReadonlyArray<ExecutionHistoryEntry> {
    return this._stateMutator.getExecutionHistory();
  }

  public addExecutionHistoryEntry(entry: ExecutionHistoryEntry): void {
    this._stateMutator.addExecutionHistoryEntry(entry);
  }

  public setConversationHistory(history: ActivityHistoryVO): void {
    this._stateMutator.setConversationHistory(history);
  }

  public setExecutionHistory(history: ExecutionHistoryEntry[]): void {
    this._stateMutator.setExecutionHistory(history);
  }

  public get attemptsMade(): number {
    return this.props.attemptsMade;
  }

  public get payload(): P {
    return this.props.payload;
  }

  public get name(): string {
    return this.props.name;
  }

  public get userId(): string | undefined {
    return this.props.payload.userId;
  }

  public get workerId(): string | undefined {
    return this.props.workerId;
  }

  public get status(): JobStatus {
    return this.props.status;
  }

  public get options(): JobOptionsVO {
    return this.props.options;
  }

  public get lockUntil(): Date | null | undefined {
    return this.props.lockUntil;
  }

  public toPersistence(): JobEntityProps<P, R> {
    return this.props;
  }

  public static fromPersistenceData<P extends { userId?: string }, R>(props: JobEntityProps<P, R>, initialConversationHistory?: ActivityHistoryVO, initialExecutionHistory?: ExecutionHistoryEntry[]): JobEntity<P, R> {
    return new JobEntity<P, R>(props as InternalJobEntityProps<P, R>, initialConversationHistory, initialExecutionHistory);
  }
}

// Re-export relevant types
export { JobStatus, type JobEntityProps };

