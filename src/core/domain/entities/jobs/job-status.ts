// src/core/domain/entities/jobs/job-status.ts

export enum JobStatusType {
  WAITING = 'WAITING',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  DELAYED = 'DELAYED',
}

export class JobStatus {
  public readonly value: JobStatusType;

  constructor(status: JobStatusType) {
    this.value = status;
  }

  public is(status: JobStatusType): boolean {
    return this.value === status;
  }

  public moveTo(newStatus: JobStatusType): JobStatus {
    // Basic transition, can be expanded with validation rules later
    // For example, check if the transition is valid from the current status.
    return new JobStatus(newStatus);
  }

  public static create(status: JobStatusType = JobStatusType.WAITING): JobStatus {
    return new JobStatus(status);
  }
}
