// src_refactored/core/domain/job/value-objects/job-status.vo.ts
import { AbstractValueObject } from '../../../common/value-objects/abstract.vo';
import { ValueError } from '../../../common/errors';

export enum JobStatusEnum {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  DELAYED = 'DELAYED',
  WAITING_CHILDREN = 'WAITING_CHILDREN', // Job is waiting for dependent (child) jobs to complete
  // STALLED is not an explicit status jobs are set to, but a condition identified by the scheduler.
  // A stalled job would typically be moved back to PENDING or FAILED.
  // CANCELLED could be added if explicit cancellation is a feature.
}

const VALID_JOB_STATUSES = Object.values(JobStatusEnum);

export class JobStatusVO extends AbstractValueObject<JobStatusEnum> {
  private constructor(value: JobStatusEnum) {
    super(value);
  }

  public static create(value: string | JobStatusEnum): JobStatusVO {
    const upperValue = typeof value === 'string' ? value.toUpperCase() : value;
    if (!VALID_JOB_STATUSES.includes(upperValue as JobStatusEnum)) {
      throw new ValueError(`Invalid JobStatus: ${value}. Must be one of ${VALID_JOB_STATUSES.join(', ')}.`);
    }
    return new JobStatusVO(upperValue as JobStatusEnum);
  }

  public static pending(): JobStatusVO { return new JobStatusVO(JobStatusEnum.PENDING); }
  public static active(): JobStatusVO { return new JobStatusVO(JobStatusEnum.ACTIVE); }
  public static completed(): JobStatusVO { return new JobStatusVO(JobStatusEnum.COMPLETED); }
  public static failed(): JobStatusVO { return new JobStatusVO(JobStatusEnum.FAILED); }
  public static delayed(): JobStatusVO { return new JobStatusVO(JobStatusEnum.DELAYED); }
  public static waitingChildren(): JobStatusVO { return new JobStatusVO(JobStatusEnum.WAITING_CHILDREN); }

  public get value(): JobStatusEnum {
    return this.props;
  }

  public is(status: JobStatusEnum): boolean {
    return this.props === status;
  }

  public isTerminal(): boolean {
    return this.props === JobStatusEnum.COMPLETED || this.props === JobStatusEnum.FAILED;
  }

  public isProcessable(): boolean {
    return this.props === JobStatusEnum.PENDING; // Only PENDING is directly processable by a worker poll
                                               // DELAYED needs promotion, WAITING_CHILDREN needs deps met.
  }
}
