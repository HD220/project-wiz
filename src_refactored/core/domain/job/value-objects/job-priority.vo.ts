// src_refactored/core/domain/job/value-objects/job-priority.vo.ts
import { AbstractValueObject } from '../../../common/value-objects/abstract.vo';
import { ValueError } from '../../../common/errors';

// BullMQ priorities: lower number = higher priority. Default is effectively 0 if not specified.
// Let's define a reasonable range, e.g., 1 (highest) to 10 (lowest), with a default.
const MIN_PRIORITY = 1;
const MAX_PRIORITY = 10; // Arbitrary max, can be adjusted. BullMQ uses a much larger range.
const DEFAULT_PRIORITY = 5;

export class JobPriorityVO extends AbstractValueObject<number> {
  private constructor(value: number) {
    super(value);
  }

  public static create(value?: number | null): JobPriorityVO {
    const priority = value === undefined || value === null ? DEFAULT_PRIORITY : value;
    if (typeof priority !== 'number' || !Number.isInteger(priority) || priority < MIN_PRIORITY || priority > MAX_PRIORITY) {
      throw new ValueError(
        `Invalid JobPriority: ${priority}. Must be an integer between ${MIN_PRIORITY} and ${MAX_PRIORITY}.`
      );
    }
    return new JobPriorityVO(priority);
  }

  public static default(): JobPriorityVO {
    return new JobPriorityVO(DEFAULT_PRIORITY);
  }

  public static highest(): JobPriorityVO {
    return new JobPriorityVO(MIN_PRIORITY);
  }

  public static lowest(): JobPriorityVO {
    return new JobPriorityVO(MAX_PRIORITY);
  }

  public get value(): number {
    return this.props;
  }

  public isHigherThan(other: JobPriorityVO): boolean {
    return this.props < other.props; // Lower number means higher priority
  }
}
