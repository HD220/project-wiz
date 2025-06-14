import { JobId } from "./value-objects/job-id.vo";
import { OK, Result } from "../../../../shared/result";

export enum JobStatus {
  PENDING = "pending",
  PROCESSING = "processing",
  COMPLETED = "completed",
  FAILED = "failed",
}

export enum JobPriority {
  LOW = "low",
  NORMAL = "normal",
  HIGH = "high",
  CRITICAL = "critical",
}

type JobProps = {
  id: JobId;
  data: unknown;
  status: JobStatus;
  priority: JobPriority;
  createdAt: Date;
  updatedAt: Date;
  attempts: number;
  maxAttempts: number;
  error?: string;
};

export class Job {
  private constructor(private readonly fields: JobProps) {}

  get id() {
    return this.fields.id;
  }
  get data() {
    return this.fields.data;
  }
  get status() {
    return this.fields.status;
  }
  get priority() {
    return this.fields.priority;
  }
  get createdAt() {
    return this.fields.createdAt;
  }
  get updatedAt() {
    return this.fields.updatedAt;
  }
  get attempts() {
    return this.fields.attempts;
  }
  get maxAttempts() {
    return this.fields.maxAttempts;
  }
  get error() {
    return this.fields.error;
  }

  static create(
    props: Omit<
      JobProps,
      "id" | "createdAt" | "updatedAt" | "attempts" | "status"
    >
  ): Result<Job> {
    const now = new Date();
    const job = new Job({
      ...props,
      id: JobId.generate(),
      createdAt: now,
      updatedAt: now,
      attempts: 0,
      status: JobStatus.PENDING,
    });

    return OK(job);
  }

  markAsProcessing(): Job {
    return new Job({
      ...this.fields,
      status: JobStatus.PROCESSING,
      updatedAt: new Date(),
    });
  }

  markAsCompleted(): Job {
    return new Job({
      ...this.fields,
      status: JobStatus.COMPLETED,
      updatedAt: new Date(),
    });
  }

  markAsFailed(error: string): Job {
    return new Job({
      ...this.fields,
      status: JobStatus.FAILED,
      updatedAt: new Date(),
      error,
      attempts: this.fields.attempts + 1,
    });
  }

  canRetry(): boolean {
    return this.fields.attempts < this.fields.maxAttempts;
  }
}
