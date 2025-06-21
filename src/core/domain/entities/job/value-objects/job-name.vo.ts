import { z } from 'zod';

const jobNameSchema = z.string().min(1, { message: "Job name cannot be empty" });

export class JobName {
  private constructor(private readonly value: string) {
    jobNameSchema.parse(value); // Validate on construction
  }

  public static create(name: string): JobName {
    return new JobName(name);
  }

  public getValue(): string {
    return this.value;
  }

  public equals(other: JobName): boolean {
    return this.value === other.value;
  }
}
