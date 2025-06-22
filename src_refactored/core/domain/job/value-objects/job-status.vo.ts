// src_refactored/core/domain/job/value-objects/job-status.vo.ts
import { AbstractValueObject, ValueObjectProps } from '../../../../core/common/value-objects/base.vo';

export enum JobStatusType {
  PENDING = 'PENDING',     // Newly created, ready to be picked up if no dependencies or delay
  WAITING = 'WAITING',     // Waiting for dependencies to complete or for a specific time (after delay)
  ACTIVE = 'ACTIVE',       // Currently being processed by a worker
  COMPLETED = 'COMPLETED', // Successfully processed
  FAILED = 'FAILED',       // Failed processing after all retries or due to critical error
  DELAYED = 'DELAYED',     // Execution postponed (e.g., for retry backoff or scheduled future execution)
  // CANCELLED = 'CANCELLED', // Possible future status
}

interface JobStatusProps extends ValueObjectProps {
  value: JobStatusType;
}

export class JobStatus extends AbstractValueObject<JobStatusProps> {
  private constructor(value: JobStatusType) {
    super({ value });
  }

  private static isValidTransition(current: JobStatusType, next: JobStatusType): boolean {
    // Define valid state transitions
    // Example:
    // if (current === JobStatusType.PENDING && (next === JobStatusType.ACTIVE || next === JobStatusType.WAITING)) return true;
    // if (current === JobStatusType.WAITING && next === JobStatusType.ACTIVE) return true;
    // ... more transitions
    // For now, allow any transition but this should be tightened.
    // The entity or service using this VO would typically enforce transition logic.
    // This VO's role is to represent a valid status.
    return true; // Simplified for now
  }

  public static create(value: JobStatusType): JobStatus {
    if (!Object.values(JobStatusType).includes(value)) {
      throw new Error(`Invalid JobStatusType: ${value}`);
    }
    return new JobStatus(value);
  }

  public static pending(): JobStatus {
    return new JobStatus(JobStatusType.PENDING);
  }

  public static waiting(): JobStatus {
    return new JobStatus(JobStatusType.WAITING);
  }

  public static active(): JobStatus {
    return new JobStatus(JobStatusType.ACTIVE);
  }

  public static completed(): JobStatus {
    return new JobStatus(JobStatusType.COMPLETED);
  }

  public static failed(): JobStatus {
    return new JobStatus(JobStatusType.FAILED);
  }

  public static delayed(): JobStatus {
    return new JobStatus(JobStatusType.DELAYED);
  }

  public value(): JobStatusType {
    return this.props.value;
  }

  public is(statusType: JobStatusType): boolean {
    return this.props.value === statusType;
  }

  public isTerminal(): boolean {
    return this.props.value === JobStatusType.COMPLETED || this.props.value === JobStatusType.FAILED;
  }

  public isProcessable(): boolean {
    return this.props.value === JobStatusType.PENDING || this.props.value === JobStatusType.WAITING;
  }

  // moveTo method removed as state transitions should be handled by the Job entity
  // to ensure all related properties (like timestamps, attempts) are updated consistently.
  // The Job entity will use JobStatus.create(JobStatusType.NEW_STATUS).

  public toString(): string {
    return this.props.value;
  }
}
