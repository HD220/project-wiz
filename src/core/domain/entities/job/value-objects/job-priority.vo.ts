import { Identity } from "../../../../../core/common/identity";
import { Result, ok, error } from "../../../../../shared/result";

export class JobPriority extends Identity<number> {
  private constructor(value: number) {
    super(value);
  }

  public static create(value: number): Result<JobPriority> {
    if (value < 0 || !Number.isInteger(value)) {
      return error("JobPriority must be a non-negative integer.");
    }
    return ok<JobPriority>(new JobPriority(value));
  }
}
