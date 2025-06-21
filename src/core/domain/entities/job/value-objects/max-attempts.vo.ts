import { z } from 'zod';

const maxAttemptsSchema = z.number().int().positive({ message: "Max attempts must be a positive integer." });

export class MaxAttempts {
  private constructor(private readonly value: number) {
    maxAttemptsSchema.parse(value);
  }

  public static create(value: number): MaxAttempts {
    return new MaxAttempts(value);
  }

  public getValue(): number {
    return this.value;
  }

  public equals(other: MaxAttempts): boolean {
    return this.value === other.value;
  }
}
