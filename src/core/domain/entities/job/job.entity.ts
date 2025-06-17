import { JobId } from "./value-objects/job-id.vo";
import { ActivityType } from "./value-objects/activity-type.vo";
import { ActivityContext } from "./value-objects/activity-context.vo";
import { JobStatus } from "./value-objects/job-status.vo";
import { RetryPolicy } from "./value-objects/retry-policy.vo";
import { JobPriority } from "./value-objects/job-priority.vo";
import { JobDependsOn } from "./value-objects/job-depends-on.vo";
import { RelatedActivityIds } from "./value-objects/related-activity-ids.vo";
import { jobSchema } from "./job.schema";
import { JobBuilder } from "./job-builder";
import { Ok } from "../../../../shared/result";

export type JobProps = {
  id: JobId;
  name: string;
  status: JobStatus;
  attempts: number;
  retryPolicy?: RetryPolicy;
  createdAt: Date;
  updatedAt?: Date;
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
};

export class Job {
  constructor(private readonly fields: JobProps) {
    jobSchema.parse(this.fields);
  }

  get id(): JobId {
    return this.fields.id;
  }

  get name(): string {
    return this.fields.name;
  }

  get status(): JobStatus {
    return this.fields.status;
  }

  get retryPolicy(): RetryPolicy | undefined {
    return this.fields.retryPolicy;
  }

  get createdAt(): Date {
    return this.fields.createdAt;
  }

  get updatedAt(): Date | undefined {
    return this.fields.updatedAt;
  }

  get attempts(): number {
    return this.fields.attempts;
  }

  get payload(): Record<string, unknown> | undefined {
    return this.fields.payload;
  }

  calculateBackoffDelay(): number {
    if (!this.retryPolicy) return 0;
    return this.retryPolicy.calculateDelay(this.attempts);
  }

  get data(): Record<string, unknown> | undefined {
    return this.fields.data;
  }

  get result(): unknown | undefined {
    return this.fields.result;
  }

  get priority(): JobPriority | undefined {
    return this.fields.priority;
  }

  get dependsOn(): JobDependsOn | undefined {
    return this.fields.dependsOn;
  }

  get activityType(): ActivityType | undefined {
    return this.fields.activityType;
  }

  get context(): ActivityContext | undefined {
    return this.fields.context;
  }

  get parentId(): JobId | undefined {
    return this.fields.parentId;
  }

  get relatedActivityIds(): RelatedActivityIds | undefined {
    return this.fields.relatedActivityIds;
  }

  withAttempt(attempts: number): Job {
    return new JobBuilder(this.fields)
      .withAttempts(attempts)
      .withUpdatedAt(new Date())
      .build();
  }

  get metadata(): Record<string, unknown> | undefined {
    return this.fields.metadata;
  }

  updateStatus(newStatus: JobStatus): Job {
    this.ensureValidStatusTransition(newStatus);
    return new JobBuilder(this.fields)
      .withStatus(newStatus)
      .withUpdatedAt(new Date())
      .build();
  }

  private ensureValidStatusTransition(newStatus: JobStatus): void {
    if (this.status.canTransitionTo(newStatus.value)) {
      return; // Valid transition, do nothing
    }
    throw new Error(
      `Invalid status transition from ${this.status.value} to ${newStatus.value}`
    );
  }

  start(): Job {
    return this.updateStatus(this.status.transitionTo("EXECUTING"));
  }

  complete(): Job {
    return this.updateStatus(this.status.transitionTo("FINISHED"));
  }

  fail(): Job {
    return this.updateStatus(this.status.transitionTo("FAILED"));
  }

  delay(): Job {
    return this.updateStatus(this.status.transitionTo("DELAYED"));
  }

  toWaiting(): Job {
    return this.updateStatus(this.status.transitionTo("WAITING"));
  }

  toPending(payload?: Record<string, unknown>): Job {
    const newStatus = this.status.transitionTo("PENDING");
    this.ensureValidStatusTransition(newStatus);

    return new JobBuilder(this.fields)
      .withStatus(newStatus)
      .withUpdatedAt(new Date())
      .withPayload(payload) // Apply payload directly, even if undefined
      .build();
  }
}
