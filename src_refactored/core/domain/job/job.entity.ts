import { AbstractEntity } from "@/core/common/base.entity";

import { ExecutionHistoryEntry } from "./job-processing.types";
import { JobStateMutator } from "./job-state.mutator";
import {
  JobStatus,
  // JobLogEntry, // No longer directly used in this file
  JobEntityProps,
  // JobPersistenceData, // Not used directly in this file after refactor
} from "./job.types";
import {
  ActivityHistoryVO,
  ActivityHistoryEntryVO,
} from "./value-objects/activity-history.vo";
import { JobIdVO } from "./value-objects/job-id.vo";
import { IJobOptions, JobOptionsVO } from "./value-objects/job-options.vo";

export class JobEntity<P = unknown, R = unknown> extends AbstractEntity<
  JobIdVO,
  JobEntityProps<P, R>
> {
  private _progressChanged: boolean = false;
  private _logsChanged: boolean = false;
  private _stateMutator: JobStateMutator<P, R>;

  private constructor(
    props: JobEntityProps<P, R>,
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

  public static create<P, R>(params: {
    id?: JobIdVO;
    queueName: string;
    name: string;
    payload: P;
    options?: IJobOptions;
  }): JobEntity<P, R> {
    const jobOptions = JobOptionsVO.create(params.options);
    const idFromOptions = jobOptions.jobId;
    const finalJobId =
      params.id ||
      (idFromOptions ? JobIdVO.create(idFromOptions) : JobIdVO.create());
    const now = new Date();

    const props: JobEntityProps<P, R> = {
      id: finalJobId,
      queueName: params.queueName,
      name: params.name,
      payload: params.payload,
      options: jobOptions,
      status: (jobOptions.delay && jobOptions.delay > 0) ? JobStatus.DELAYED : JobStatus.WAITING,
      attemptsMade: 0,
      progress: 0,
      logs: [],
      createdAt: now,
      updatedAt: now,
      delayUntil: (jobOptions.delay && jobOptions.delay > 0) ? new Date(now.getTime() + jobOptions.delay) : undefined,
    };
    return new JobEntity<P, R>(props, ActivityHistoryVO.create(), []);
  }

  // Expose props directly or through a single getter as per AGENTS.md for data-rich entities
  public getProps(): Readonly<JobEntityProps<P, R>> {
    return this.props;
  }

  // Keep getters with logic
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

  // toPersistence() method is now removed and handled by JobPersistenceMapper.

  public getConversationHistory(): ActivityHistoryVO {
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
}
