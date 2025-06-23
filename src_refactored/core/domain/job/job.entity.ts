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
import { AgentJobState, ExecutionHistoryEntry, AgentExecutorResult, AgentExecutorStatus } from './job-processing.types'; // Added AgentExecutorResult, AgentExecutorStatus
import { ActivityHistoryEntry, HistoryEntryRoleType } from './value-objects/activity-history-entry.vo';
import { ActivityHistory } from './value-objects/activity-history.vo';
import { DomainError } from '../../common/errors'; // Added DomainError

// For the 'data' field of the Job, which holds agent-specific state.
// This structure aligns with what GenericAgentExecutor expects in job.data.agentState.

/**
 * Interface for storing structured information about a critical tool failure.
 */
export interface CriticalToolFailureInfo {
  toolName: string;
  errorType: string; // e.g., 'ToolNotFound', 'ValidationError', 'ExecutionError', 'UnexpectedError'
  message: string;
  details?: any; // e.g., validation issues, stack trace snippet
  isRecoverable: boolean; // From ToolError.isRecoverable
}

interface JobData {
  agentState?: AgentJobState;
  lastFailureSummary?: string; // Used by GenericAgentExecutor for re-planning context
  criticalToolFailureInfo?: CriticalToolFailureInfo; // Structured info for critical tool errors
  executionResult?: { // Storing the outcome from AgentExecutor
    status: string; // AgentExecutorStatus
    message: string;
    output?: any;
    errors?: ReadonlyArray<ExecutionHistoryEntry | string>;
  };
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
    return this; // Returning this as it's a mutable prop change, not creating new instance for this specific case.
                 // For true immutability on data changes, a new instance would be needed.
                 // Consider if data should be a VO itself.
  }

  /**
   * Updates the structured information about a critical tool failure.
   * @param info The critical tool failure information, or undefined to clear it.
   */
  public setCriticalToolFailureInfo(info?: CriticalToolFailureInfo): Job<PayloadType, ResultType> {
    this.props.data = { ...this.props.data, criticalToolFailureInfo: info };
    this.touch();
    return this;
  }

  // --- Methods to update specific properties, returning new Job instance ---
  public changeName(newName: JobName): Job<PayloadType, ResultType> {
    if (this.props.name.equals(newName)) return this;
    const newProps = { ...this.props, name: newName };
    return new Job(this._id, { ...newProps, updatedAt: JobTimestamp.now() });
  }

  public updatePayload(newPayload: PayloadType): Job<PayloadType, ResultType> {
    // For deep equality check on payload, a more sophisticated comparison might be needed if it's a complex object.
    // For now, assuming direct comparison or that change is always intended.
    // Freezing the new payload for immutability.
    const newFrozenPayload = Object.freeze({ ...newPayload });
    // Simple reference check might not be enough for objects.
    // if (this.props.payload === newFrozenPayload) return this; // This won't work for object content change

    // A more robust check would be JSON.stringify(this.props.payload) === JSON.stringify(newFrozenPayload)
    // or a deep equal utility. For simplicity, assume if called, update is desired.
    const newProps = { ...this.props, payload: newFrozenPayload };
    return new Job(this._id, { ...newProps, updatedAt: JobTimestamp.now() });
  }

  public changePriority(newPriority: JobPriority): Job<PayloadType, ResultType> {
    if (this.props.priority.equals(newPriority)) return this;
    const newProps = { ...this.props, priority: newPriority };
    return new Job(this._id, { ...newProps, updatedAt: JobTimestamp.now() });
  }

  public changeTargetAgentRole(newTargetAgentRole?: TargetAgentRole): Job<PayloadType, ResultType> {
    if (this.props.targetAgentRole?.equals(newTargetAgentRole) || (this.props.targetAgentRole === undefined && newTargetAgentRole === undefined)) {
      return this;
    }
    const newProps = { ...this.props, targetAgentRole: newTargetAgentRole };
    return new Job(this._id, { ...newProps, updatedAt: JobTimestamp.now() });
  }

  public updateRetryPolicy(newRetryPolicy: RetryPolicy): Job<PayloadType, ResultType> {
    if (this.props.retryPolicy.equals(newRetryPolicy)) return this;
    // Also update maxAttempts if it's directly stored and derived from retryPolicy
    const newProps = {
      ...this.props,
      retryPolicy: newRetryPolicy,
      maxAttempts: newRetryPolicy.maxAttempts() // Ensure consistency
    };
    return new Job(this._id, { ...newProps, updatedAt: JobTimestamp.now() });
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

  public moveToCancelled(reason?: string): boolean { // Added reason parameter
    if (this.props.status.isTerminal()) return false; // Cannot cancel if already in a terminal state

    this.props = {
        ...this.props,
        status: JobStatus.cancelled(),
        // Optionally store reason in data, if JobData schema supports it
        // data: { ...this.props.data, cancellationReason: reason },
    };
    this.touch();
    return true;
  }

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

  public prepareForNextAttempt(): Job<PayloadType, ResultType> {
    if (!this.status().is(JobStatusType.FAILED) && !this.status().is(JobStatusType.ACTIVE)) {
      // Typically retried from FAILED. Retrying an ACTIVE job might mean cancelling and retrying.
      // For simplicity, allow retry from FAILED or if it was stuck in ACTIVE.
      console.warn(`Job ${this.id().value()} is being prepared for retry from a non-FAILED/non-ACTIVE status: ${this.status().value()}`);
      // Or throw new Error(`Job ${this.id().value()} cannot be prepared for retry from status ${this.status().value()}`);
    }
    if (!this.canRetry()) {
      throw new DomainError(`Job ${this.id().value()} has reached max attempts and cannot be retried.`);
    }

    // Create a new state for the retried job
    // Attempts will be incremented when moveToActive is called by the worker.
    // Result and lastFailureSummary should be cleared.
    const newPropsState: JobState<PayloadType, ResultType> = {
      ...this.props,
      result: undefined, // Clear previous result
      data: {
        ...this.props.data,
        lastFailureSummary: undefined, // Clear last failure summary
        executionResult: undefined, // Clear previous execution result
        // agentState might need to be reset or preserved depending on retry strategy.
        // For now, preserve agentState.
      },
      // Status and executeAfter will be set by moveToDelayed/moveToPending below
    };

    // Calculate delay and set status. moveToDelayed handles transition to PENDING if delay is 0.
    // We need to pass the current props to a new Job instance, then call moveToDelayed on it.
    // This is a bit tricky as moveToDelayed modifies props in place then calls touch.
    // A cleaner way might be for moveToDelayed to also return a new Job instance.
    // For now, let's create a temporary instance to call moveToDelayed and then use its props.

    let tempJobForStatus = new Job(this._id, newPropsState);
    tempJobForStatus.moveToDelayed(); // This modifies tempJobForStatus.props

    // Create the final new Job instance with the updated props from tempJobForStatus
    return new Job(this._id, tempJobForStatus.props);
  }

  /**
   * Finalizes the job's execution state based on the AgentExecutorResult.
   * This method updates the job's status and stores the execution result details.
   * It should be called before persisting the job after an execution attempt.
   *
   * @param executorResult The result from the agent executor.
   */
  public finalizeExecution(executorResult: AgentExecutorResult): void {
    if (this.isTerminal()) {
      // Potentially log a warning if trying to finalize an already terminal job.
      // This might happen if save fails and executor is retried, but job was already finalized.
      console.warn(`Job ${this.id().value()} is already in a terminal state (${this.status().value()}) and finalizeExecution was called.`);
      // Still update executionResult in data, as it might contain more recent error details.
    }

    // Store the execution result in props.data
    this.props.data = {
      ...this.props.data,
      executionResult: {
        status: executorResult.status,
        message: executorResult.message,
        output: executorResult.output,
        errors: executorResult.errors,
      },
    };

    // Update job status based on executorResult.status
    switch (executorResult.status) {
      case 'SUCCESS':
        this.props = { ...this.props, status: JobStatus.completed(), result: executorResult.output as ResultType };
        break;
      case 'FAILURE_MAX_ITERATIONS':
      case 'FAILURE_LLM':
      case 'FAILURE_TOOL':
      case 'FAILURE_INTERNAL':
        this.props = {
          ...this.props,
          status: JobStatus.failed(),
          // Store a summary in the main 'result' for quick inspection, or the full executorResult.message.
          // The detailed executionResult is in props.data.executionResult.
          result: { error: executorResult.message, status: executorResult.status } as any,
        };
        break;
      default:
        // Should not happen if AgentExecutorStatus is exhaustive
        console.error(`Job ${this.id().value()}: Unknown AgentExecutorStatus received: ${executorResult.status}`);
        this.props = { ...this.props, status: JobStatus.failed() }; // Default to FAILED
        break;
    }

    this.touch(); // Update 'updatedAt' timestamp
  }
}
