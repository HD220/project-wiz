import { z } from "zod";

export const jobStatusSchema = z.enum([
  "PENDING",
  "WAITING",
  "DELAYED",
  "EXECUTING",
  "FINISHED",
  "FAILED",
  "CANCELLED",
]);

export type JobStatusType = z.infer<typeof jobStatusSchema>;

export class JobStatus {
  protected constructor(private readonly status: JobStatusType) {
    jobStatusSchema.parse(status);
  }

  get value(): JobStatusType {
    return this.status;
  }

  public is(statusValue: JobStatusType): boolean {
    return this.status === statusValue;
  }

  static create(status: JobStatusType): JobStatus {
    return new JobStatus(status);
  }

  static createInitial(): JobStatus {
    return new JobStatus("PENDING");
  }

  static createCancelled(): JobStatus {
    return new JobStatus("CANCELLED");
  }

  canTransitionTo(newStatus: JobStatusType): boolean {
    const validTransitions: Record<JobStatusType, JobStatusType[]> = {
      PENDING: ["EXECUTING", "DELAYED", "CANCELLED"],
      WAITING: ["PENDING", "CANCELLED"],
      DELAYED: ["PENDING", "CANCELLED"],
      EXECUTING: ["FINISHED", "FAILED", "DELAYED", "CANCELLED"],
      FINISHED: [],
      FAILED: ["DELAYED"],
      CANCELLED: [],
    };

    return validTransitions[this.status].includes(newStatus);
  }

  transitionTo(newStatus: JobStatusType): JobStatus {
    if (!this.canTransitionTo(newStatus)) {
      throw new Error(
        `Invalid status transition from ${this.status} to ${newStatus}`
      );
    }
    return new JobStatus(newStatus);
  }
}
