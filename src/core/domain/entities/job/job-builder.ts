import { Job, JobProps } from "./job.entity";
import { JobId } from "./value-objects/job-id.vo";
import { ActivityType } from "./value-objects/activity-type.vo";
import { ActivityContext } from "./value-objects/activity-context.vo";
import { JobStatus } from "./value-objects/job-status.vo";
import { RetryPolicy } from "./value-objects/retry-policy.vo";
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
  }

  withId(id: JobId): JobBuilder {
    this.fields.id = id;
    return this;
  }

  withName(name: string): JobBuilder {
    this.fields.name = name;
    return this;
  }

  withStatus(status: JobStatus): JobBuilder {
    this.ensureValidStatusTransition(status);
    this.fields.status = status;
    return this;
  }

  private ensureValidStatusTransition(newStatus: JobStatus): void {
    if (
      this.fields.status &&
      this.fields.status.canTransitionTo(newStatus.value)
    ) {
      return; // Valid transition, do nothing
    }

    if (this.fields.status) {
      throw new Error(
        `Invalid status transition from ${this.fields.status.value} to ${newStatus.value}`
      );
    }

    // If there's no existing status, any status is valid for initial creation
  }

  withRetryPolicy(retryPolicy: RetryPolicy): JobBuilder {
    this.fields.retryPolicy = retryPolicy;
    return this;
  }

  withCreatedAt(createdAt: Date): JobBuilder {
    this.fields.createdAt = createdAt;
    return this;
  }

  withUpdatedAt(updatedAt: Date): JobBuilder {
    this.fields.updatedAt = updatedAt;
    return this;
  }

  withAttempts(attempts: number): JobBuilder {
    this.fields.attempts = attempts;
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
    const defaultPriority = (JobPriority.create(0) as Ok<JobPriority>).value;
    const defaultDependsOn = new JobDependsOn([]);
    const defaultRelatedActivityIds: JobId[] = [];

    const jobProps: JobProps = {
      id: this.fields.id!,
      name: this.fields.name!,
      status: this.fields.status!,
      attempts: this.fields.attempts || 0,
      retryPolicy: this.fields.retryPolicy,
      createdAt: this.fields.createdAt!,
      updatedAt: this.fields.updatedAt,
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
