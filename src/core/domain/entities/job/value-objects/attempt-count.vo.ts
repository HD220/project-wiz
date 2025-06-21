import { z } from 'zod';

const attemptCountSchema = z.number().min(0, { message: "Attempt count cannot be negative" });

export class AttemptCount {
  private constructor(private readonly value: number) {
    attemptCountSchema.parse(value); // Validate on construction
  }

  public static create(count: number): AttemptCount {
    return new AttemptCount(count);
  }

  public getValue(): number {
    return this.value;
  }

  public increment(): AttemptCount {
    return new AttemptCount(this.value + 1);
  }

  public equals(other: AttemptCount): boolean {
    return this.value === other.value;
  }
}
