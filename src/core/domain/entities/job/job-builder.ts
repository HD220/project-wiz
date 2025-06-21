import { Job, JobProps } from "./job.entity";
import { JobId } from "./value-objects/job-id.vo";
import { ActivityType } from "./value-objects/activity-type.vo";
import { ActivityContext } from "./value-objects/activity-context.vo";
import { JobStatus } from "./value-objects/job-status.vo";
// Updated imports for RetryPolicy and new VOs
import { IRetryPolicy } from "./value-objects/retry-policy.interface";
import { NoRetryPolicy } from "./value-objects/no-retry-policy";
import { RetryPolicy } from "./value-objects/retry-policy.vo"; // May still be needed if passed in directly
import { JobName } from "./value-objects/job-name.vo";
import { AttemptCount } from "./value-objects/attempt-count.vo";
import { JobTimestamp } from "./value-objects/job-timestamp.vo";
import { JobPriority } from "./value-objects/job-priority.vo";
import { JobDependsOn } from "./value-objects/job-depends-on.vo";
import { RelatedActivityIds } from "./value-objects/related-activity-ids.vo";
import { Ok } from "../../../../shared/result";


export class JobBuilder {
  private fields: Partial<JobProps>;

  constructor(fields?: Partial<JobProps>) {
    this.fields = fields ? { ...fields } : {};
    if (!this.fields.status) {
      this.fields.status = JobStatus.createInitial();
    }
    if (!this.fields.attempts) {
      this.fields.attempts = AttemptCount.create(0);
    }
    if (!this.fields.createdAt) {
      this.fields.createdAt = JobTimestamp.now();
    }
  }

  withId(id: JobId): JobBuilder {
    this.fields.id = id;
    return this;
  }

  withName(name: string): JobBuilder {
    this.fields.name = JobName.create(name);
    return this;
  }

  withStatus(status: JobStatus): JobBuilder {
    // ensureValidStatusTransition is removed as this logic is now in JobStatus VO or Job entity
    this.fields.status = status;
    return this;
  }

  // ensureValidStatusTransition removed

  withRetryPolicy(retryPolicy: IRetryPolicy): JobBuilder {
    this.fields.retryPolicy = retryPolicy;
    return this;
  }

  withCreatedAt(createdAt: Date): JobBuilder {
    this.fields.createdAt = JobTimestamp.create(createdAt);
    return this;
  }

  withUpdatedAt(updatedAt: Date): JobBuilder {
    this.fields.updatedAt = JobTimestamp.create(updatedAt);
    return this;
  }

  withAttempts(attempts: number): JobBuilder {
    this.fields.attempts = AttemptCount.create(attempts);
    return this;
  }

  withPayload(payload: Record<string, unknown> | undefined): JobBuilder {
    this.fields.payload = payload;
    return this;
  }

  withMetadata(metadata: Record<string, unknown>): JobBuilder {
    this.fields.metadata = metadata;
    return this;
  }

  withData(data: Record<string, unknown>): JobBuilder {
    this.fields.data = data;
    return this;
  }

  withResult(result: unknown): JobBuilder {
    this.fields.result = result;
    return this;
  }

  withPriority(priority: JobPriority): JobBuilder {
    this.fields.priority = priority;
    return this;
  }

  withDependsOn(dependsOn: JobDependsOn): JobBuilder {
    this.fields.dependsOn = dependsOn;
    return this;
  }

  withActivityType(activityType?: ActivityType): JobBuilder {
    this.fields.activityType = activityType;
    return this;
  }

  withContext(context?: ActivityContext): JobBuilder {
    this.fields.context = context;
    return this;
  }

  withParentId(parentId?: JobId): JobBuilder {
    this.fields.parentId = parentId;
    return this;
  }

  withRelatedActivityIds(relatedActivityIds?: RelatedActivityIds): JobBuilder {
    this.fields.relatedActivityIds = relatedActivityIds;
    return this;
  }

  build(): Job {
    const defaultPriority = (JobPriority.create(0) as Ok<JobPriority>).value; // Assuming JobPriority.create returns Result
    const defaultDependsOn = new JobDependsOn([]);
    // defaultRelatedActivityIds not used directly in JobProps based on current JobProps definition

    // Validate required fields before building
    if (!this.fields.id) {
      throw new Error("Job ID is required to build a Job.");
    }
    if (!this.fields.name) {
      // this.fields.name is JobName, which would be created by withName.
      // If withName was never called, this.fields.name would be undefined.
      throw new Error("Job Name is required to build a Job.");
    }
    // status, attempts, createdAt are defaulted in constructor

    const currentRetryPolicy = this.fields.retryPolicy || NoRetryPolicy.create();

    const jobProps: JobProps = {
      id: this.fields.id as JobId, // Validated above
      name: this.fields.name as JobName, // Validated above
      status: this.fields.status as JobStatus, // Defaulted
      attempts: this.fields.attempts as AttemptCount, // Defaulted
      retryPolicy: currentRetryPolicy,
      createdAt: this.fields.createdAt as JobTimestamp, // Defaulted
      updatedAt: this.fields.updatedAt, // Already JobTimestamp | undefined
      payload: this.fields.payload,
      metadata: this.fields.metadata,
      data: this.fields.data,
      result: this.fields.result,
      priority: this.fields.priority || defaultPriority,
      dependsOn: this.fields.dependsOn || defaultDependsOn,
      activityType: this.fields.activityType,
      context: this.fields.context,
      parentId: this.fields.parentId,
      relatedActivityIds: this.fields.relatedActivityIds,
    };

    return new Job(jobProps);
  }
}
