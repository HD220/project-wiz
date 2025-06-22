// src_refactored/core/domain/job/value-objects/attempt-count.vo.ts
import { AbstractValueObject, ValueObjectProps } from '../../../../core/common/value-objects/base.vo';

interface AttemptCountProps extends ValueObjectProps {
  value: number;
}

export class AttemptCount extends AbstractValueObject<AttemptCountProps> {
  private constructor(value: number) {
    super({ value });
  }

  private static validate(count: number): void {
    if (!Number.isInteger(count) || count < 0) {
      throw new Error(`Attempt count must be a non-negative integer. Received: ${count}`);
    }
  }

  public static create(count: number): AttemptCount {
    this.validate(count);
    return new AttemptCount(count);
  }

  public static initial(): AttemptCount {
    return new AttemptCount(0);
  }

  public value(): number {
    return this.props.value;
  }

  public increment(): AttemptCount {
    return new AttemptCount(this.props.value + 1);
  }

  public isLessThan(maxAttempts: MaxAttempts): boolean {
    return this.props.value < maxAttempts.value();
  }

  public toString(): string {
    return String(this.props.value);
  }
}

// Dependent VO: MaxAttempts
interface MaxAttemptsProps extends ValueObjectProps {
  value: number;
}

export class MaxAttempts extends AbstractValueObject<MaxAttemptsProps> {
  private constructor(value: number) {
    super({ value });
  }

  private static validate(count: number): void {
    if (!Number.isInteger(count) || count < 1) {
      // Max attempts should be at least 1
      throw new Error(`Max attempts must be a positive integer. Received: ${count}`);
    }
  }

  public static create(count: number): MaxAttempts {
    this.validate(count);
    return new MaxAttempts(count);
  }

  public static default(): MaxAttempts {
    return new MaxAttempts(1); // Default to 1 attempt (no retries)
  }

  public static unlimited(): MaxAttempts {
    return new MaxAttempts(Infinity); // Represents unlimited retries conceptually
  }


  public value(): number {
    return this.props.value;
  }

  public allowsMoreAttempts(currentAttempts: AttemptCount): boolean {
    if (this.props.value === Infinity) return true; // Unlimited retries
    return currentAttempts.value() < this.props.value;
  }

  public toString(): string {
    return String(this.props.value);
  }
}
