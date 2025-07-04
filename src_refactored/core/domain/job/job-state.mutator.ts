// src_refactored/core/domain/job/job-state.mutator.ts
import { DomainError } from '@/core/domain/common/errors';

import { ExecutionHistoryEntry } from './job-processing.types';
import { JobEntityProps, JobStatus } from './job.entity';
import { ActivityHistoryVO, ActivityHistoryEntryVO } from './value-objects/activity-history.vo';

export class JobStateMutator<P, R> {
  private props: JobEntityProps<P, R>;
  private _conversationHistory: ActivityHistoryVO;
  private _executionHistory: ExecutionHistoryEntry[];

  constructor(
    props: JobEntityProps<P, R>,
    initialConversationHistory?: ActivityHistoryVO,
    initialExecutionHistory?: ExecutionHistoryEntry[]
  ) {
    this.props = props;
    this._conversationHistory = initialConversationHistory || ActivityHistoryVO.create();
    this._executionHistory = initialExecutionHistory || [];
  }

  public moveToActive(workerId: string, lockUntil: Date): void {
    if (this.props.status !== JobStatus.WAITING && this.props.status !== JobStatus.PAUSED && this.props.status !== JobStatus.DELAYED) {
      throw new DomainError(`Job ${this.props.id.value} cannot be moved to active from status ${this.props.status}`);
    }
    this.props.status = JobStatus.ACTIVE;
    this.props.workerId = workerId;
    this.props.lockUntil = lockUntil;
    this.props.processedOn = new Date();
    this.props.updatedAt = new Date();
    this.props.attemptsMade += 1;
  }

  public extendLock(newLockUntil: Date, workerId: string): void {
    if (this.props.status !== JobStatus.ACTIVE || this.props.workerId !== workerId) {
      throw new DomainError(`Cannot extend lock for job ${this.props.id.value}: not active by worker ${workerId}.`);
    }
    this.props.lockUntil = newLockUntil;
    this.props.updatedAt = new Date();
  }

  public markAsCompleted(returnValue: R): void {
    if (this.props.status !== JobStatus.ACTIVE) {
      console.warn(`Job ${this.props.id.value} attempted to complete but was not in ACTIVE state (current: ${this.props.status}).`);
    }
    this.props.status = JobStatus.COMPLETED;
    this.props.returnValue = returnValue;
    this.props.finishedOn = new Date();
    this.props.updatedAt = this.props.finishedOn;
    this.props.failedReason = null;
    this.props.stacktrace = null;
    this.props.lockUntil = null;
    this.props.workerId = null;
  }

  public markAsFailed(reason: string, stacktrace?: string[]): void {
     if (this.props.status !== JobStatus.ACTIVE) {
      console.warn(`Job ${this.props.id.value} attempted to fail but was not in ACTIVE state (current: ${this.props.status}).`);
    }
    this.props.status = JobStatus.FAILED;
    this.props.failedReason = reason;
    this.props.stacktrace = stacktrace;
    this.props.finishedOn = new Date();
    this.props.updatedAt = this.props.finishedOn;
    this.props.lockUntil = null;
    this.props.workerId = null;
  }

  public moveToDelayed(delayUntil: Date, originalError?: Error): void {
    this.props.status = JobStatus.DELAYED;
    this.props.delayUntil = delayUntil;
    this.props.updatedAt = new Date();
    this.props.processedOn = null;
    this.props.lockUntil = null;
    this.props.workerId = null;
    if (originalError) {
        this.props.failedReason = originalError.message;
    }
  }

  public moveToWaiting(): void {
    if (this.props.status !== JobStatus.DELAYED && this.props.status !== JobStatus.PAUSED) {
      // Intentionally empty: Condition checked, no specific action if true besides proceeding.
    }
    this.props.status = JobStatus.WAITING;
    this.props.delayUntil = null;
    this.props.processedOn = null;
    this.props.updatedAt = new Date();
    this.props.lockUntil = null;
    this.props.workerId = null;
  }

  public markAsStalled(): boolean {
    this.props.lockUntil = null;
    this.props.workerId = null;
    this.props.processedOn = null;
    this.props.updatedAt = new Date();

    if (this.props.attemptsMade >= this.props.options.attempts) {
        this.props.status = JobStatus.FAILED;
        this.props.failedReason = this.props.failedReason || 'Job failed after becoming stalled and exceeding max attempts.';
        this.props.finishedOn = new Date();
        return true;
    }
    return false;
  }

  public pause(): void {
    if (this.props.status === JobStatus.WAITING || this.props.status === JobStatus.DELAYED) {
      this.props.status = JobStatus.PAUSED;
      this.props.updatedAt = new Date();
    } else {
      throw new DomainError(`Cannot pause job ${this.props.id.value} in status ${this.props.status}.`);
    }
  }

  public resume(): void {
    if (this.props.status === JobStatus.PAUSED) {
      this.props.status = this.props.delayUntil && this.props.delayUntil > new Date() ? JobStatus.DELAYED : JobStatus.WAITING;
      this.props.updatedAt = new Date();
    } else {
      throw new DomainError(`Cannot resume job ${this.props.id.value} in status ${this.props.status}.`);
    }
  }

  // --- Agent Processing State Management ---
  public getConversationHistory(): ActivityHistoryVO {
    return this._conversationHistory;
  }

  public addConversationEntry(entry: ActivityHistoryEntryVO): void {
    this._conversationHistory = this._conversationHistory.addEntry(entry);
  }

  public getExecutionHistory(): ReadonlyArray<ExecutionHistoryEntry> {
    return Object.freeze([...this._executionHistory]);
  }

  public addExecutionHistoryEntry(entry: ExecutionHistoryEntry): void {
    this._executionHistory.push(entry);
  }

  public setConversationHistory(history: ActivityHistoryVO): void {
    this._conversationHistory = history;
  }

  public setExecutionHistory(history: ExecutionHistoryEntry[]): void {
    this._executionHistory = history;
  }
}
