// src_refactored/core/domain/job/value-objects/job-name.vo.ts
import { AbstractValueObject, ValueObjectProps } from '../../../../core/common/value-objects/base.vo';

interface JobNameProps extends ValueObjectProps {
  value: string;
}

export class JobName extends AbstractValueObject<JobNameProps> {
  private static readonly MIN_LENGTH = 1;
  private static readonly MAX_LENGTH = 150; // Jobs can have descriptive names

  private constructor(value: string) {
    super({ value });
  }

  private static validate(name: string): void {
    if (name.trim().length < this.MIN_LENGTH) {
      throw new Error(`Job name must be at least ${this.MIN_LENGTH} character long.`);
    }
    if (name.length > this.MAX_LENGTH) {
      throw new Error(`Job name must be at most ${this.MAX_LENGTH} characters long.`);
    }
    // Allowed characters: letters, numbers, underscores, hyphens, spaces
    if (!/^[a-zA-Z0-9_-\s]+$/.test(name)) {
      throw new Error('Job name contains invalid characters.');
    }
  }

  public static create(name: string): JobName {
    const trimmedName = name.trim();
    this.validate(trimmedName);
    return new JobName(trimmedName);
  }

  public value(): string {
    return this.props.value;
  }

  public toString(): string {
    return this.props.value;
  }
}
