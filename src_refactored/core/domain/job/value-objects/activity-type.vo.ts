// src_refactored/core/domain/job/value-objects/activity-type.vo.ts
import { AbstractValueObject, ValueObjectProps } from '../../../../core/common/value-objects/base.vo';

interface ActivityTypeProps extends ValueObjectProps {
  value: string; // e.g., "code_generation", "file_analysis", "test_execution"
}

export class ActivityType extends AbstractValueObject<ActivityTypeProps> {
  private static readonly MAX_LENGTH = 50;
  private static readonly VALID_FORMAT_REGEX = /^[a-z0-9_]+$/; // lowercase, numbers, underscore

  private constructor(value: string) {
    super({ value });
  }

  private static validate(type: string): void {
    if (!type || type.trim().length === 0) {
      throw new Error('Activity type cannot be empty.');
    }
    if (type.length > this.MAX_LENGTH) {
      throw new Error(`Activity type must be at most ${this.MAX_LENGTH} characters long.`);
    }
    if (!this.VALID_FORMAT_REGEX.test(type)) {
      throw new Error(
        `Activity type '${type}' has an invalid format. Must be lowercase, numbers, or underscores.`,
      );
    }
  }

  public static create(type: string): ActivityType {
    const trimmedType = type.trim();
    this.validate(trimmedType);
    return new ActivityType(trimmedType);
  }

  public value(): string {
    return this.props.value;
  }

  public toString(): string {
    return this.props.value;
  }
}
