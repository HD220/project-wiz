import { z } from 'zod';

const delayMillisecondsSchema = z.number().int().nonnegative({ message: "Delay milliseconds must be a non-negative integer." });

export class DelayMilliseconds {
  private constructor(private readonly value: number) {
    delayMillisecondsSchema.parse(value);
  }

  public static create(value: number): DelayMilliseconds {
    return new DelayMilliseconds(value);
  }

  public static zero(): DelayMilliseconds {
    return new DelayMilliseconds(0);
  }

  public getValue(): number {
    return this.value;
  }

  public equals(other: DelayMilliseconds): boolean {
    return this.value === other.value;
  }
}
