import { Job, JobProps } from "./job.entity";
import { JobId } from "./value-objects/job-id.vo";
import { JobStatus } from "./value-objects/job-status.vo";
import { RetryPolicy } from "./value-objects/retry-policy.vo";

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
    if (
      this.fields.status &&
      !this.fields.status.canTransitionTo(status.value)
    ) {
      throw new Error(
        `Invalid status transition from ${this.fields.status.value} to ${status.value}`
      );
    }
    this.fields.status = status;
    return this;
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

  withPayload(payload: Record<string, unknown>): JobBuilder {
    this.fields.payload = payload;
    return this;
  }

  withMetadata(metadata: Record<string, unknown>): JobBuilder {
    this.fields.metadata = metadata;
    return this;
  }

  build(): Job {
    return new Job({
      id: this.fields.id!,
      name: this.fields.name!,
      status: this.fields.status!,
      attempts: this.fields.attempts || 0,
      retryPolicy: this.fields.retryPolicy,
      createdAt: this.fields.createdAt!,
      updatedAt: this.fields.updatedAt,
      payload: this.fields.payload,
      metadata: this.fields.metadata,
    });
  }
}
