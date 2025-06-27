// src_refactored/core/domain/job/value-objects/job-progress.vo.ts
import { ValueError } from '@/domain/common/errors';
import { AbstractValueObject } from '@/core/common/value-objects/base.vo';

// Progress can be a simple percentage or a more complex object.
export type JobProgressData = number | Record<string, any>;

export class JobProgressVO extends AbstractValueObject<JobProgressData> {
  private constructor(value: JobProgressData) {
    super(value);
  }

  public static create(value: JobProgressData): JobProgressVO {
    if (typeof value === 'number') {
      if (value < 0 || value > 100) {
        throw new ValueError('Progress percentage must be between 0 and 100.');
      }
    } else if (typeof value !== 'object' || value === null) {
      throw new ValueError('Invalid job progress value. Must be a number or an object.');
    }
    // For objects, no specific validation here, but could be added if a schema is enforced.
    return new JobProgressVO(value);
  }

  public static initial(): JobProgressVO {
    return new JobProgressVO(0); // Default progress is 0 percent
  }

  public get value(): JobProgressData {
    // Return a copy if it's an object to maintain immutability of the VO's internal state
    if (typeof this.props === 'object' && this.props !== null) {
      return { ...this.props };
    }
    return this.props;
  }
}
