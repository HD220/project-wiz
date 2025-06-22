// src_refactored/core/domain/job/value-objects/job-priority.vo.ts
import { AbstractValueObject, ValueObjectProps } from '../../../../core/common/value-objects/base.vo';

interface JobPriorityProps extends ValueObjectProps {
  value: number; // Lower number means higher priority
}

export class JobPriority extends AbstractValueObject<JobPriorityProps> {
  public static readonly HIGHEST = 0;
  public static readonly HIGH = 5;
  public static readonly NORMAL = 10;
  public static readonly LOW = 15;
  public static readonly LOWEST = 20;

  private constructor(value: number) {
    super({ value });
  }

  private static validate(priority: number): void {
    if (!Number.isInteger(priority) || priority < 0) {
      throw new Error(`Job priority must be a non-negative integer. Received: ${priority}`);
    }
    // Could add a max practical limit if desired, e.g., 100.
  }

  public static create(priority: number): JobPriority {
    this.validate(priority);
    return new JobPriority(priority);
  }

  public static default(): JobPriority {
    return new JobPriority(this.NORMAL);
  }

  public value(): number {
    return this.props.value;
  }

  public isHigherThan(otherPriority: JobPriority): boolean {
    return this.props.value < otherPriority.value();
  }

  public toString(): string {
    return String(this.props.value);
  }
}
