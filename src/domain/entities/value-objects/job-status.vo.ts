// src/domain/entities/value-objects/job-status.vo.ts
export class JobStatusVO {
  private static readonly VALID_STATUSES = [
    'PENDING', 'ACTIVE', 'COMPLETED', 'FAILED',
    'DELAYED', 'WAITING_CHILDREN'
  ] as const;
  readonly value: typeof JobStatusVO.VALID_STATUSES[number];

  private constructor(status: typeof JobStatusVO.VALID_STATUSES[number]) {
    this.value = status;
  }

  public static create(status: string): JobStatusVO {
    if (!JobStatusVO.VALID_STATUSES.includes(status as any)) {
      throw new Error(`Invalid job status: ${status}`);
    }
    return new JobStatusVO(status as any);
  }

  public is(status: string): boolean {
    return this.value === status;
  }
}
