import { z } from 'zod';
import { DomainError } from '@/core/common/errors';

export enum ValidationStatusType {
  PASSED = "PASSED",
  FAILED = "FAILED",
  PENDING = "PENDING",
}

const validationStatusSchema = z.nativeEnum(ValidationStatusType, {
  errorMap: (issue, ctx) => {
    if (issue.code === z.ZodIssueCode.invalid_enum_value) {
      return { message: `Invalid validation status. Allowed statuses are: ${Object.values(ValidationStatusType).join(", ")}.` };
    }
    return { message: ctx.defaultError };
  }
});

export type InferValidationStatusType = z.infer<typeof validationStatusSchema>;

export class ValidationStatus {
  private constructor(private readonly value: InferValidationStatusType) {}

  public static create(status: string): ValidationStatus {
    try {
      const validatedStatus = validationStatusSchema.parse(status);
      return new ValidationStatus(validatedStatus);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new DomainError(`Invalid ValidationStatus: ${error.errors.map(e => e.message).join(', ')}`);
      }
      throw error;
    }
  }

  public static passed(): ValidationStatus {
    return new ValidationStatus(ValidationStatusType.PASSED);
  }

  public static failed(): ValidationStatus {
    return new ValidationStatus(ValidationStatusType.FAILED);
  }

  public static pending(): ValidationStatus {
    return new ValidationStatus(ValidationStatusType.PENDING);
  }

  public getValue(): InferValidationStatusType {
    return this.value;
  }

  public isPassed(): boolean {
    return this.value === ValidationStatusType.PASSED;
  }

  public isFailed(): boolean {
    return this.value === ValidationStatusType.FAILED;
  }

  public isPending(): boolean {
    return this.value === ValidationStatusType.PENDING;
  }

  public equals(other: ValidationStatus): boolean {
    return this.value === other.value;
  }
}
