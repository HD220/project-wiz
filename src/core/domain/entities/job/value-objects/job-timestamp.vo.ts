import { z } from 'zod';

// Zod schema for basic Date validation
const jobTimestampSchema = z.date();

export class JobTimestamp {
  private constructor(private readonly value: Date) {
    jobTimestampSchema.parse(value); // Validate on construction
  }

  public static create(date: Date): JobTimestamp {
    return new JobTimestamp(new Date(date.getTime())); // Create a new Date instance to ensure immutability
  }

  public static now(): JobTimestamp {
    return new JobTimestamp(new Date());
  }

  public getValue(): Date {
    return new Date(this.value.getTime()); // Return a new Date instance to ensure immutability
  }

  public equals(other: JobTimestamp): boolean {
    return this.value.getTime() === other.value.getTime();
  }
}
