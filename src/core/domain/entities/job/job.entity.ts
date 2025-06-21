import { JobId } from "./value-objects/job-id.vo";
import { ActivityType } from "./value-objects/activity-type.vo";
import { ActivityContext } from "./value-objects/activity-context.vo";
import { JobStatus } from "./value-objects/job-status.vo";
// Import IRetryPolicy and NoRetryPolicy, and specific VOs if needed for type hints
import { IRetryPolicy } from "./value-objects/retry-policy.interface";
import { RetryPolicy } from "./value-objects/retry-policy.vo"; // Still needed for z.instanceof if used
import { NoRetryPolicy } from "./value-objects/no-retry-policy"; // Still needed for z.instanceof if used
import { DelayMilliseconds } from "./value-objects/delay-milliseconds.vo";
import { JobPriority } from "./value-objects/job-priority.vo";
import { JobDependsOn } from "./value-objects/job-depends-on.vo";
import { RelatedActivityIds } from "./value-objects/related-activity-ids.vo";
import { jobSchema } from "./job.schema";
import { JobBuilder } from "./job-builder";
import { Ok } from "../../../../shared/result";

// Import new VOs
import { JobName } from "./value-objects/job-name.vo";
import { AttemptCount } from "./value-objects/attempt-count.vo";
import { JobTimestamp } from "./value-objects/job-timestamp.vo";
import { AgentId } from "../../agent/value-objects/agent-id.vo"; // Added import
import { DomainError } from "../../../../core/common/errors"; // Added import

export type JobProps = {
  id: JobId;
  name: JobName;
  status: JobStatus;
  attempts: AttemptCount; // Changed from number
  retryPolicy: IRetryPolicy; // Changed from RetryPolicy | undefined
  createdAt: JobTimestamp; // Changed from Date
  updatedAt?: JobTimestamp; // Changed from Date
  payload?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  data?: Record<string, unknown>;
  result?: unknown;
  priority?: JobPriority;
  dependsOn?: JobDependsOn;
  activityType?: ActivityType;
  context?: ActivityContext;
  parentId?: JobId;
  relatedActivityIds?: RelatedActivityIds;
  agentId?: AgentId; // Added agentId
};

// TODO: OBJECT_CALISTHENICS_REFACTOR: This entity is undergoing refactoring to reduce direct state exposure.
// The `getProps()` method is a temporary measure for external consumers (like mappers/serializers or use cases
// during transition) that need to read Job state.
// Ideally, direct state access will be replaced by more behavior-oriented methods on this entity
// or handled by dedicated mappers in the infrastructure layer for persistence/DTO conversion.
// Consumers of the removed individual getters should be updated to:
// 1. Use `job.getProps().fieldName` as a temporary workaround if simple data access is needed.
// 2. Prefer invoking new behavioral methods on the Job entity (to be added as needed).
// 3. For persistence, mappers should ideally know how to construct DB entities from Job's state via `getProps()`.
export class Job {
  constructor(private readonly fields: JobProps) {
    // TODO: jobSchema currently expects primitive types for name, attempts, createdAt, updatedAt.
    // It needs to be updated to handle the new Value Object types,
    // possibly by using z.custom() or by parsing the .getValue() of each VO.
    // For now, this validation will likely fail or not validate correctly.
    // Consider adjusting jobSchema or implementing a separate validation step for VOs if needed.
    // For retryPolicy, schema would need to be z.custom<IRetryPolicy>(...)
    jobSchema.parse({
      ...this.fields,
      name: this.fields.name.getValue(),
      attempts: this.fields.attempts.getValue(),
      createdAt: this.fields.createdAt.getValue(),
      updatedAt: this.fields.updatedAt?.getValue(),
      // retryPolicy: this.fields.retryPolicy, // This would pass the object, jobSchema needs to handle it
    });
  }

  // TODO: OBJECT_CALISTHENICS_REFACTOR - See comment at the top of the class.
  public getProps(): Readonly<JobProps> {
    return { ...this.fields };
  }

  // All individual getters below are removed in favor of getProps() and behavioral methods.
  // get id(): JobId {
  //   return this.fields.id;
  // }

  // get name(): JobName {
  //   return this.fields.name;
  // }

  // status getter removed
  // retryPolicy getter removed
  // attempts getter removed

  // get createdAt(): JobTimestamp {
  //   return this.fields.createdAt;
  // }

  // get updatedAt(): JobTimestamp | undefined {
  //   return this.fields.updatedAt;
  // }

  // get payload(): Record<string, unknown> | undefined {
  //   return this.fields.payload;
  // }

  // get data(): Record<string, unknown> | undefined {
  //   return this.fields.data;
  // }

  // get result(): unknown | undefined {
  //   return this.fields.result;
  // }

  // get priority(): JobPriority | undefined {
  //   return this.fields.priority;
  // }

  // get dependsOn(): JobDependsOn | undefined {
  //   return this.fields.dependsOn;
  // }

  // get activityType(): ActivityType | undefined {
  //   return this.fields.activityType;
  // }

  // get context(): ActivityContext | undefined {
  //   return this.fields.context;
  // }

  // get parentId(): JobId | undefined {
  //   return this.fields.parentId;
  // }

  // get relatedActivityIds(): RelatedActivityIds | undefined {
  //   return this.fields.relatedActivityIds;
  // }

  // get metadata(): Record<string, unknown> | undefined {
  //   return this.fields.metadata;
  // }

  // Behavioral methods for status
  public isPending(): boolean {
    return this.fields.status.is("PENDING");
  }

  public isExecuting(): boolean {
    return this.fields.status.is("EXECUTING");
  }

  public isFinished(): boolean {
    return this.fields.status.is("FINISHED");
  }

  public isFailed(): boolean {
    return this.fields.status.is("FAILED");
  }

  public isCancelled(): boolean {
    return this.fields.status.is("CANCELLED");
  }

  public isWaiting(): boolean {
    return this.fields.status.is("WAITING");
  }

  public isDelayed(): boolean {
    return this.fields.status.is("DELAYED");
  }

  // New behavioral method for retry
  public canBeRetried(): boolean {
    return this.fields.retryPolicy.shouldRetry(this.fields.attempts);
  }

  /**
   * Calculates the backoff delay for the current number of attempts.
   * This method now delegates to the retryPolicy associated with the job.
   * @returns DelayMilliseconds instance representing the calculated delay.
   */
  calculateBackoffDelay(): DelayMilliseconds {
    // JobBuilder is responsible for ensuring fields.retryPolicy is always an IRetryPolicy (e.g. NoRetryPolicy by default)
    return this.fields.retryPolicy.calculateDelay(this.fields.attempts);
  }

  withAttempt(attempts: AttemptCount): Job { // Parameter type changed
    // Note: This method creates a new Job instance via the builder.
    // If JobBuilder uses this.fields directly (which it does by spreading),
    // then this is fine.
    return new JobBuilder(this.fields)
      .withAttempts(attempts)
      .withUpdatedAt(JobTimestamp.now())
      .build();
  }

  // metadata getter was also removed

  // Updated to accept an optional timestamp
  updateStatus(newStatus: JobStatus, timestamp?: JobTimestamp): Job { // Ensure DomainError is imported
    // The ensureValidStatusTransition logic is now expected to be within JobStatus VO
    // when transitioning. So, no explicit call here.
    // JobStatus.transitionTo should throw if invalid or return the new valid status.
    // For this refactor, we assume newStatus is ALREADY the result of a valid transition
    // from this.fields.status. If JobStatus.transitionTo itself needs to be created/modified
    // to enforce this, that's a change in JobStatus.ts.
    // The line below now assumes 'newStatus' is the state post-validation & transition.
    return new JobBuilder(this.fields)
      .withStatus(newStatus) // newStatus is now the result of a successful transition
      .withUpdatedAt(timestamp || JobTimestamp.now()) // Use provided timestamp or now
      .build();
  }

  // This method is now effectively replaced by logic within JobStatus.
  // Or, if JobStatus.transitionTo doesn't throw, this method might still be needed
  // but would call a validation method on this.status, e.g., this.status.validateTransitionTo(newStatus).
  // For this task, we assume JobStatus's transition method handles validation.
  // private ensureValidStatusTransition(newStatus: JobStatus): void {
  //   // Logic moved to JobStatus VO.
  //   // Example: this.status.transitionTo(newStatus.getValueAsString()) might throw an error.
  //   // No direct call to newStatus.value to avoid Law of Demeter violation.
  // }

  start(timestamp?: JobTimestamp): Job { // Added optional timestamp
    // Assumes this.fields.status.transitionTo("EXECUTING") returns a new JobStatus instance
    // and throws an error if the transition is invalid.
    return this.updateStatus(this.fields.status.transitionTo("EXECUTING"), timestamp);
  }

  complete(timestamp?: JobTimestamp): Job { // Added optional timestamp
    return this.updateStatus(this.fields.status.transitionTo("FINISHED"), timestamp);
  }

  fail(timestamp?: JobTimestamp): Job { // Added optional timestamp
    return this.updateStatus(this.fields.status.transitionTo("FAILED"), timestamp);
  }

  delay(timestamp?: JobTimestamp): Job { // Added optional timestamp
    return this.updateStatus(this.fields.status.transitionTo("DELAYED"), timestamp);
  }

  toWaiting(timestamp?: JobTimestamp): Job { // Added optional timestamp
    return this.updateStatus(this.fields.status.transitionTo("WAITING"), timestamp);
  }

  // toPending already uses JobBuilder directly, so it can manage its own timestamp.
  // For consistency, we can make it accept a timestamp too.
  toPending(payload?: Record<string, unknown>, timestamp?: JobTimestamp): Job {
    // Assumes this.fields.status.transitionTo("PENDING") returns a new JobStatus instance
    // and throws an error if the transition is invalid.
    const newStatus = this.fields.status.transitionTo("PENDING");
    // No explicit ensureValidStatusTransition call needed if JobStatus.transitionTo handles it.

    return new JobBuilder(this.fields)
      .withStatus(newStatus)
      .withUpdatedAt(timestamp || JobTimestamp.now()) // Use provided timestamp or now
      .withPayload(payload) // Apply payload directly, even if undefined
      .build();
  }

  public cancel(timestamp: JobTimestamp): Job {
    // The JobStatus.transitionTo("CANCELLED") method is responsible for
    // throwing an error if the transition from the current status is invalid.
    const newCancelledStatus = this.fields.status.transitionTo("CANCELLED");

    // We need to update the Job's overall timestamp using the provided one,
    // not just rely on JobBuilder's default JobTimestamp.now() in updateStatus if not careful.
    // The updateStatus method already sets updatedAt to JobTimestamp.now().
    // To use the specific timestamp passed to cancel(), we can directly use JobBuilder here.
    return new JobBuilder(this.fields)
      .withStatus(newCancelledStatus)
      .withUpdatedAt(timestamp) // Use the passed timestamp
      .build();
  }

  public equals(other?: Job): boolean {
    if (this === other) return true;
    if (!other || !(other instanceof Job)) return false;

    const currentProps = this.getProps(); // Use getProps to access fields for comparison
    const otherProps = other.getProps();

    // Compare mandatory fields
    if (!currentProps.id.equals(otherProps.id)) return false;
    if (!currentProps.name.equals(otherProps.name)) return false;
    if (!currentProps.status.equals(otherProps.status)) return false;
    if (!currentProps.attempts.equals(otherProps.attempts)) return false;
    if (!currentProps.retryPolicy.equals(otherProps.retryPolicy)) return false; // Assuming IRetryPolicy has equals
    if (!currentProps.createdAt.equals(otherProps.createdAt)) return false;

    // Compare optional fields (VOs)
    const compareOptionalVOs = <T extends { equals(o?: T): boolean }>(v1?: T, v2?: T): boolean => {
        if (v1 === undefined && v2 === undefined) return true;
        if (v1 && v2) return v1.equals(v2);
        return false; // One is defined, the other is not
    };

    if (!compareOptionalVOs(currentProps.updatedAt, otherProps.updatedAt)) return false;
    if (!compareOptionalVOs(currentProps.priority, otherProps.priority)) return false;
    if (!compareOptionalVOs(currentProps.dependsOn, otherProps.dependsOn)) return false;
    if (!compareOptionalVOs(currentProps.activityType, otherProps.activityType)) return false;
    if (!compareOptionalVOs(currentProps.context, otherProps.context)) return false; // Assumes ActivityContext has equals
    if (!compareOptionalVOs(currentProps.parentId, otherProps.parentId)) return false;
    if (!compareOptionalVOs(currentProps.relatedActivityIds, otherProps.relatedActivityIds)) return false;
    if (!compareOptionalVOs(currentProps.agentId, otherProps.agentId)) return false; // Added agentId

    // Compare plain object fields (payload, metadata, data, result)
    // This might need more sophisticated deep comparison for objects/arrays if not VOs
    if (JSON.stringify(currentProps.payload) !== JSON.stringify(otherProps.payload)) return false;
    if (JSON.stringify(currentProps.metadata) !== JSON.stringify(otherProps.metadata)) return false;
    if (JSON.stringify(currentProps.data) !== JSON.stringify(otherProps.data)) return false;
    if (JSON.stringify(currentProps.result) !== JSON.stringify(otherProps.result)) return false;

    return true;
  }

  public recordFailedAttemptAndPrepareForRetry(timestamp: JobTimestamp): { updatedJob: Job; nextRunAt?: Date } {
    if (!this.canBeRetried()) {
        throw new DomainError("Job cannot be retried: max attempts reached or no retry policy.");
    }

    const currentAttemptsVo = this.fields.attempts; // Already an AttemptCount VO
    const newAttemptsVo = currentAttemptsVo.increment(); // Use increment method

    // Create a temporary Job instance or props with the new attempt count to pass to calculateBackoffDelay
    // This is because calculateBackoffDelay uses this.fields.attempts.
    // We need to simulate the state *after* attempt increment for correct delay calculation.
    const tempPropsForDelayCalculation: JobProps = {
        ...this.fields,
        attempts: newAttemptsVo,
        // Note: status is still the old status here, which is fine for calculateBackoffDelay
    };
    // Creating a temporary Job instance to call its calculateBackoffDelay.
    // This is a bit indirect. If calculateBackoffDelay could take attempts as a parameter,
    // or if RetryPolicy.calculateDelay was called directly here, it might be cleaner.
    // However, calculateBackoffDelay is on the Job entity and encapsulates retryPolicy interaction.
    const tempJobForDelay = new Job(tempPropsForDelayCalculation);
    const delayDuration = tempJobForDelay.calculateBackoffDelay(); // Uses newAttemptsVo via tempJobForDelay.fields

    let nextRunAtDate: Date | undefined = undefined;
    let finalStatusVo: JobStatus;

    if (delayDuration.getValue() > 0) {
        finalStatusVo = this.fields.status.transitionTo("DELAYED"); // Use current status to transition
        nextRunAtDate = new Date(Date.now() + delayDuration.getValue());
    } else {
        // If no delay (e.g. retry immediately or no retry policy defined to cause delay), set to PENDING
        finalStatusVo = this.fields.status.transitionTo("PENDING");
    }

    // Use JobBuilder to construct the final updated Job instance
    const builder = new JobBuilder(this.fields) // Start with original fields
        .withAttempts(newAttemptsVo)       // Set incremented attempts
        .withStatus(finalStatusVo)         // Set new status (DELAYED or PENDING)
        .withUpdatedAt(timestamp);         // Set the provided timestamp for this update

    const updatedJobInstance = builder.build();

    return { updatedJob: updatedJobInstance, nextRunAt: nextRunAtDate };
  }

  public toPlainObject(): Record<string, any> {
    const props = this.getProps();
    const plain: Record<string, any> = {
      id: props.id.getValue(),
      name: props.name.getValue(),
      status: props.status.getValue(),
      attempts: props.attempts.getValue(),
      createdAt: props.createdAt.getValue().toISOString(), // ISO string for dates
      updatedAt: props.updatedAt?.getValue().toISOString(),
      payload: props.payload,
      metadata: props.metadata,
      data: props.data,
      result: props.result,
      priority: props.priority?.getValue(),
      activityType: props.activityType?.getValue(),
      parentId: props.parentId?.getValue(),
      agentId: props.agentId?.getValue(),
    };

    // For complex VOs/Collections, call their own toPlainObject or serialize methods
    if (props.retryPolicy instanceof RetryPolicy) { // Check specific type if IRetryPolicy doesn't have getParams
        plain.retryPolicy = props.retryPolicy.getParams(); // Assuming getParams returns RetryPolicyParams
    } else if (props.retryPolicy instanceof NoRetryPolicy) {
        plain.retryPolicy = { type: 'NoRetryPolicy' }; // Or however NoRetryPolicy should be serialized
    }

    if (props.dependsOn) {
      plain.dependsOn = props.dependsOn.getValues().map(id => id.getValue());
    }
    if (props.relatedActivityIds) {
      plain.relatedActivityIds = props.relatedActivityIds.getValues().map(id => id.getValue());
    }
    if (props.context) {
      plain.context = props.context.toPlainObject ? props.context.toPlainObject() : props.context.getProps();
      // ^ Assumes ActivityContext will have toPlainObject() or getProps() returns serializable plain object
    }
    // Filter out undefined values from plain object
    Object.keys(plain).forEach(key => plain[key] === undefined && delete plain[key]);
    return plain;
  }
}

// Fully refactored JobBuilder class
export class JobBuilder {
  private fields: Partial<JobProps>;

  constructor(fields?: Partial<JobProps>) {
    this.fields = fields ? { ...fields } : {};

    // Ensure defaults are VOs
    if (!this.fields.status) {
      this.fields.status = JobStatus.createInitial();
    }
    if (!this.fields.attempts) {
      this.fields.attempts = AttemptCount.create(0);
    }
    if (!this.fields.createdAt) {
      this.fields.createdAt = JobTimestamp.now();
    }
    // No default for agentId, it remains optional
  }

  withId(id: JobId): JobBuilder {
    this.fields.id = id;
    return this;
  }

  withName(name: string): JobBuilder { // Accepts primitive, creates VO
    this.fields.name = JobName.create(name);
    return this;
  }

  withStatus(status: JobStatus): JobBuilder {
    this.fields.status = status;
    return this;
  }

  withAttempts(attempts: AttemptCount | number): JobBuilder { // Accepts VO or number
    if (typeof attempts === 'number') {
      this.fields.attempts = AttemptCount.create(attempts);
    } else {
      this.fields.attempts = attempts;
    }
    return this;
  }

  withRetryPolicy(retryPolicy: IRetryPolicy): JobBuilder {
    this.fields.retryPolicy = retryPolicy;
    return this;
  }

  withCreatedAt(createdAt: JobTimestamp | Date): JobBuilder { // Accepts VO or Date
    if (createdAt instanceof Date) {
      this.fields.createdAt = JobTimestamp.create(createdAt);
    } else {
      this.fields.createdAt = createdAt;
    }
    return this;
  }

  withUpdatedAt(updatedAt: JobTimestamp | Date | undefined): JobBuilder { // Accepts VO or Date or undefined
    if (updatedAt === undefined) {
        this.fields.updatedAt = undefined;
    } else if (updatedAt instanceof Date) {
      this.fields.updatedAt = JobTimestamp.create(updatedAt);
    } else {
      this.fields.updatedAt = updatedAt;
    }
    return this;
  }

  withPayload(payload: Record<string, unknown> | undefined): JobBuilder {
    this.fields.payload = payload;
    return this;
  }

  withMetadata(metadata: Record<string, unknown> | undefined): JobBuilder {
    this.fields.metadata = metadata;
    return this;
  }

  withData(data: Record<string, unknown> | undefined): JobBuilder {
    this.fields.data = data;
    return this;
  }

  withResult(result: unknown | undefined): JobBuilder {
    this.fields.result = result;
    return this;
  }

  withPriority(priority: JobPriority | number | undefined): JobBuilder { // Accepts VO or number
    if (priority === undefined) {
        this.fields.priority = undefined;
    } else if (typeof priority === 'number') {
      this.fields.priority = JobPriority.create(priority);
    } else {
      this.fields.priority = priority;
    }
    return this;
  }

  withDependsOn(dependsOn: JobDependsOn | JobId[] | undefined): JobBuilder { // Accepts VO or array of JobId
    if (dependsOn === undefined) {
        this.fields.dependsOn = undefined;
    } else if (Array.isArray(dependsOn)) {
      this.fields.dependsOn = JobDependsOn.create(dependsOn);
    } else {
      this.fields.dependsOn = dependsOn;
    }
    return this;
  }

  withActivityType(activityType: ActivityType | string | undefined): JobBuilder { // Accepts VO or string
     if (activityType === undefined) {
        this.fields.activityType = undefined;
    } else if (typeof activityType === 'string') {
      this.fields.activityType = ActivityType.create(activityType);
    } else {
      this.fields.activityType = activityType;
    }
    return this;
  }

  withContext(context: ActivityContext | undefined): JobBuilder {
    this.fields.context = context;
    return this;
  }

  withParentId(parentId: JobId | undefined): JobBuilder {
    this.fields.parentId = parentId;
    return this;
  }

  withRelatedActivityIds(relatedActivityIds: RelatedActivityIds | JobId[] | undefined): JobBuilder { // Accepts VO or array of JobId
    if (relatedActivityIds === undefined) {
        this.fields.relatedActivityIds = undefined;
    } else if (Array.isArray(relatedActivityIds)) {
      this.fields.relatedActivityIds = RelatedActivityIds.create(relatedActivityIds);
    } else {
      this.fields.relatedActivityIds = relatedActivityIds;
    }
    return this;
  }

  withAgentId(agentId?: AgentId): JobBuilder { // New method
    this.fields.agentId = agentId;
    return this;
  }

  build(): Job {
    if (!this.fields.id) {
      throw new DomainError("Job ID is required to build a Job.");
    }
    if (!this.fields.name) {
      throw new DomainError("Job Name is required to build a Job.");
    }
    // Status, attempts, createdAt are defaulted in constructor if not provided

    const jobProps: JobProps = {
      id: this.fields.id,
      name: this.fields.name, // Already JobName VO from withName or initial fields
      status: this.fields.status!, // Defaulted in constructor
      attempts: this.fields.attempts!, // Defaulted in constructor
      retryPolicy: this.fields.retryPolicy || NoRetryPolicy.create(),
      createdAt: this.fields.createdAt!, // Defaulted in constructor
      updatedAt: this.fields.updatedAt,
      payload: this.fields.payload,
      metadata: this.fields.metadata,
      data: this.fields.data,
      result: this.fields.result,
      priority: this.fields.priority || JobPriority.create(0),
      dependsOn: this.fields.dependsOn || JobDependsOn.create([]),
      activityType: this.fields.activityType,
      context: this.fields.context,
      parentId: this.fields.parentId,
      relatedActivityIds: this.fields.relatedActivityIds,
      agentId: this.fields.agentId, // Added agentId
    };
    // The Job constructor is private. Job.create() is the static factory.
    return Job.create(jobProps);
  }
}
