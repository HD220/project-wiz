import { JobId } from "./value-objects/job-id.vo";
import { JobStatus } from "./value-objects/job-status.vo";
import { RetryPolicy } from "./value-objects/retry-policy.vo";
import { jobSchema } from "./job.schema";
import { JobBuilder } from "./job-builder"; // Revertido para import normal

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
};

export class Job {
  constructor(private readonly fields: JobProps) {
    jobSchema.parse(fields);
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

  withAttempt(attempts: number): Job {
    return new Job({
      ...this.fields,
      attempts,
      updatedAt: new Date(),
    });
  }

  get metadata(): Record<string, unknown> | undefined {
    return this.fields.metadata;
  }

  updateStatus(newStatus: JobStatus): Job {
    if (!this.status.canTransitionTo(newStatus.value)) {
      throw new Error(
        `Invalid status transition from ${this.status.value} to ${newStatus.value}`
      );
    }
    return new JobBuilder(this.fields)
      .withStatus(newStatus)
      .withUpdatedAt(new Date())
      .build();
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

  wait(): Job {
    return this.updateStatus(this.status.transitionTo("WAITING"));
  }
}
