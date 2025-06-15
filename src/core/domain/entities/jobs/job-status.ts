import { z } from "zod";

export const JobStatusValues = {
  WAITING: "waiting",
  ACTIVE: "active",
  COMPLETED: "completed",
  FAILED: "failed",
  DELAYED: "delayed",
} as const;

export type JobStatusType =
  (typeof JobStatusValues)[keyof typeof JobStatusValues];

export const jobStatusSchema = z.nativeEnum(JobStatusValues);

export class JobStatus {
  private value: JobStatusType;

  constructor(value: JobStatusType) {
    this.value = jobStatusSchema.parse(value);
  }

  get current(): JobStatusType {
    return this.value;
  }

  is(status: JobStatusType): boolean {
    return this.value === status;
  }

  moveTo(newStatus: JobStatusType): boolean {
    const validTransitions: Record<JobStatusType, JobStatusType[]> = {
      [JobStatusValues.WAITING]: [JobStatusValues.ACTIVE],
      [JobStatusValues.ACTIVE]: [
        JobStatusValues.COMPLETED,
        JobStatusValues.FAILED,
        JobStatusValues.DELAYED,
      ],
      [JobStatusValues.COMPLETED]: [],
      [JobStatusValues.FAILED]: [],
      [JobStatusValues.DELAYED]: [JobStatusValues.WAITING],
    };

    if (validTransitions[this.value].includes(newStatus)) {
      this.value = newStatus;
      return true;
    }
    return false;
  }
}
