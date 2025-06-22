// src_refactored/core/domain/job/job.entity.ts
import { JobId } from './value-objects/job-id.vo';
import { JobName } from './value-objects/job-name.vo';
import { JobStatus, JobStatusType } from './value-objects/job-status.vo';
import { JobPriority } from './value-objects/job-priority.vo';
import { JobTimestamp } from './value-objects/job-timestamp.vo';
import { AttemptCount, MaxAttempts } from './value-objects/attempt-count.vo';
import { RetryPolicy, NoRetryPolicy, RetryDelay } from './value-objects/retry-policy.vo';
import { JobDependsOn } from './value-objects/job-depends-on.vo';
import { TargetAgentRole } from './value-objects/target-agent-role.vo';
import { AgentJobState, ExecutionHistoryEntry } from './job-processing.types';
import { ActivityHistoryEntry, HistoryEntryRoleType } from './value-objects/activity-history-entry.vo';
import { ActivityHistory } from './value-objects/activity-history.vo';

// For the 'data' field of the Job, which holds agent-specific state.
// This structure aligns with what GenericAgentExecutor expects in job.data.agentState.
interface JobData {
  agentState?: AgentJobState;
  lastFailureSummary?: string; // Used by GenericAgentExecutor for re-planning context
  [key: string]: any; // Allow other dynamic data
}

// Props required to create a Job instance.
// Some are VOs, some are primitives to be wrapped by the entity's create/constructor.
interface JobConstructionProps<P = any> {
  id?: JobId;
  name: JobName;
  payload: P; // Input payload for the job
  targetAgentRole?: TargetAgentRole;
  status?: JobStatus;
  priority?: JobPriority;
  maxAttempts?: MaxAttempts;
  retryPolicy?: RetryPolicy; // More comprehensive than just initialDelay
  dependsOn?: JobDependsOn;
  executeAfter?: JobTimestamp; // For delayed jobs
  // data, result, attempts, createdAt, updatedAt are typically managed internally
}

// All properties held by the Job entity, using VOs.
// Using an interface for props to adhere to Object Calisthenics (rule of 2 instance vars for the entity class)
interface JobState<P = any, R = any> {
  readonly name: JobName;
  readonly payload: Readonly<P>;
  readonly targetAgentRole?: TargetAgentRole;

  readonly status: JobStatus;
  readonly priority: JobPriority;

  readonly attempts: AttemptCount;
  readonly maxAttempts: MaxAttempts; // Kept for direct reference, though also in RetryPolicy
  readonly retryPolicy: RetryPolicy;

  readonly dependsOn?: JobDependsOn;
  readonly executeAfter?: JobTimestamp;

  readonly createdAt: JobTimestamp;
  readonly updatedAt: JobTimestamp;

  // Mutable parts of the job's state during its lifecycle
  data: JobData; // Holds AgentJobState, etc.
  result?: Readonly<R>;
}

export class Job<PayloadType = any, ResultType = any> {
  private readonly _id: JobId; // Instance variable 1: Identity
  private props: JobState<PayloadType, ResultType>; // Instance variable 2: All other state

  private constructor(id: JobId, initialState: JobState<PayloadType, ResultType>) {
    this._id = id;
    this.props = initialState;
  }

  public static create<P = any, R = any>(
    constructProps: JobConstructionProps<P>
  ): Job<P, R> {
    const id = constructProps.id || JobId.generate();
    const now = JobTimestamp.now();

    const initialState: JobState<P, R> = {
      name: constructProps.name,
      payload: Object.freeze({ ...constructProps.payload }), // Deep freeze for safety if payload is object
      targetAgentRole: constructProps.targetAgentRole,
      status: constructProps.status || (constructProps.executeAfter && constructProps.executeAfter.isAfter(now)) ? JobStatus.delayed() : JobStatus.pending(),
      priority: constructProps.priority || JobPriority.default(),
      attempts: AttemptCount.initial(),
      maxAttempts: constructProps.maxAttempts || (constructProps.retryPolicy ? constructProps.retryPolicy.maxAttempts() : MaxAttempts.default()),
      retryPolicy: constructProps.retryPolicy || NoRetryPolicy.create(),
      dependsOn: constructProps.dependsOn || JobDependsOn.create([]),
      executeAfter: constructProps.executeAfter,
      createdAt: now,
      updatedAt: now,
      data: { // Initialize agentState with empty history
        agentState: {
          conversationHistory: ActivityHistory.create([]),
          executionHistory: []
        }
      },
      result: undefined,
    };
    return new Job<P, R>(id, initialState);
  }

  // --- Accessors for immutable properties (return VOs or readonly primitives) ---
  public id(): JobId { return this._id; }
  public name(): JobName { return this.props.name; }
  public payload(): Readonly<PayloadType> { return this.props.payload; }
  public targetAgentRole(): TargetAgentRole | undefined { return this.props.targetAgentRole; }
  public status(): JobStatus { return this.props.status; }
  public priority(): JobPriority { return this.props.priority; }
  public attempts(): AttemptCount { return this.props.attempts; }
  public maxAttempts(): MaxAttempts { return this.props.maxAttempts; }
  public retryPolicy(): RetryPolicy { return this.props.retryPolicy; }
  public dependsOn(): JobDependsOn | undefined { return this.props.dependsOn; }
  public executeAfter(): JobTimestamp | undefined { return this.props.executeAfter; }
  public createdAt(): JobTimestamp { return this.props.createdAt; }
  public updatedAt(): JobTimestamp { return this.props.updatedAt; }
  public result(): Readonly<ResultType> | undefined { return this.props.result; }

  // --- Accessor for mutable data (AgentJobState) ---
  // Returns a deep copy to ensure external modifications don't affect internal state directly
  // Modifications should happen via specific methods on Job or by replacing agentState.
  public currentData(): Readonly<JobData> {
    // Deep copy for agentState.conversationHistory and executionHistory
    const agentStateCopy: AgentJobState | undefined = this.props.data.agentState ? {
      conversationHistory: ActivityHistory.create(this.props.data.agentState.conversationHistory.entries().map(e =>
        ActivityHistoryEntry.create(e.role(), e.content(), e.timestamp(), e.toolName(), e.toolCallId())
      )),
      executionHistory: [...this.props.data.agentState.executionHistory],
    } : undefined;

    return Object.freeze({
      ...this.props.data,
      agentState: agentStateCopy
    });
  }

  // Method to update the agentState. This is crucial for GenericAgentExecutor.
  public updateAgentState(newAgentState: AgentJobState): Job<PayloadType, ResultType> {
    this.props.data = { ...this.props.data, agentState: newAgentState };
    this.touch();
    return this; // Return self for chaining if needed, or void
  }

  public updateLastFailureSummary(summary?: string): Job<PayloadType, ResultType> {
    this.props.data = { ...this.props.data, lastFailureSummary: summary };
    this.touch();
    return this;
  }

  // --- State Transition Methods (Behaviors) ---
  private touch(): void {
    this.props = { ...this.props, updatedAt: JobTimestamp.now() };
  }

  private changeStatus(newStatusType: JobStatusType): boolean {
    // Basic transition validation can be added here if JobStatus VO doesn't handle it.
    // For now, assuming any transition is valid if called.
    if (this.props.status.is(newStatusType)) return false; // No change
    this.props = { ...this.props, status: JobStatus.create(newStatusType) };
    this.touch();
    return true;
  }

  public moveToPending(): boolean { return this.changeStatus(JobStatusType.PENDING); }
  public moveToWaiting(): boolean { return this.changeStatus(JobStatusType.WAITING); }

  public moveToActive(): boolean {
    if (this.props.status.is(JobStatusType.ACTIVE)) return false;
    // Only allow moving to active from processable states
    if (!this.props.status.isProcessable() && !this.props.status.is(JobStatusType.DELAYED)) {
        // throw new Error(`Job ${this.id().value()} cannot be moved to ACTIVE from status ${this.props.status.value()}`);
        console.warn(`Job ${this.id().value()} cannot be moved to ACTIVE from status ${this.props.status.value()}`);
        return false;
    }
    this.props = {
      ...this.props,
      status: JobStatus.active(),
      attempts: this.props.attempts.increment(),
    };
    this.touch();
    return true;
  }

  public moveToCompleted(result: ResultType): boolean {
    if (this.props.status.is(JobStatusType.COMPLETED)) return false;
    // Typically from ACTIVE
    this.props = { ...this.props, status: JobStatus.completed(), result: Object.freeze(result) };
    this.touch();
    return true;
  }

  public moveToFailed(failureReason: string): boolean {
    if (this.props.status.is(JobStatusType.FAILED)) return false;
    // Store failure reason in data or result for inspection
    this.props = {
        ...this.props,
        status: JobStatus.failed(),
        // Storing simple error message in result for now. Could be structured.
        result: { error: failureReason } as any, // Cast for simplicity
    };
    this.touch();
    return true;
  }

  public moveToDelayed(delayDurationMs?: number): boolean {
    if (this.props.status.is(JobStatusType.DELAYED) && delayDurationMs === undefined) return false; // No change if already delayed and no new duration

    const calculatedDelay = delayDurationMs === undefined
                            ? this.props.retryPolicy.calculateNextDelay(this.props.attempts)
                            : RetryDelay.fromMilliseconds(delayDurationMs);

    if (calculatedDelay.value() <= 0 && this.props.retryPolicy.maxAttempts().allowsMoreAttempts(this.props.attempts)) {
        // If delay is 0 and retries allowed, move to PENDING/WAITING instead of DELAYED
        return this.moveToPending(); // Or moveToWaiting if it needs dependency checks again
    }

    this.props = {
        ...this.props,
        status: JobStatus.delayed(),
        executeAfter: JobTimestamp.fromMilliseconds(Date.now() + calculatedDelay.value()),
    };
    this.touch();
    return true;
  }

  public canRetry(): boolean {
    return this.props.retryPolicy.maxAttempts().allowsMoreAttempts(this.props.attempts);
  }

  public isTerminal(): boolean {
    return this.props.status.isTerminal();
  }

  public isProcessableNow(): boolean {
    if (!this.props.status.isProcessable()) return false;
    if (this.props.executeAfter && this.props.executeAfter.isAfter(JobTimestamp.now())) return false;
    // Dependency check would be external to this method, typically by repository or queue service
    return true;
  }

  public equals(other?: Job<any, any>): boolean {
    if (other === null || other === undefined) return false;
    if (!(other instanceof Job)) return false;
    return this._id.equals(other._id);
  }
}
