// src_refactored/core/domain/job/value-objects/context-parts/validation-status.vo.ts
import { AbstractValueObject, ValueObjectProps } from '../../../../../core/common/value-objects/base.vo';

export enum ValidationStatusType {
  NOT_VALIDATED = 'NOT_VALIDATED',
  PASSED = 'PASSED',
  FAILED = 'FAILED',
  // PENDING_USER_CONFIRMATION = 'PENDING_USER_CONFIRMATION' // Possible future state
}

interface ValidationStatusProps extends ValueObjectProps {
  value: ValidationStatusType;
  reason?: string; // Optional reason, especially if FAILED
}

export class ValidationStatus extends AbstractValueObject<ValidationStatusProps> {
  private static readonly MAX_REASON_LENGTH = 500;

  private constructor(props: ValidationStatusProps) {
    super(props);
  }

  private static validateReason(reason?: string): void {
    if (reason && reason.length > this.MAX_REASON_LENGTH) {
      throw new Error(`Validation status reason must be at most ${this.MAX_REASON_LENGTH} characters long.`);
    }
  }

  public static create(value: ValidationStatusType, reason?: string): ValidationStatus {
    if (!Object.values(ValidationStatusType).includes(value)) {
      throw new Error(`Invalid ValidationStatusType: ${value}`);
    }
    if (value !== ValidationStatusType.FAILED && reason) {
        throw new Error(`Validation reason should only be provided if status is FAILED. Status: ${value}`);
    }
    this.validateReason(reason);
    return new ValidationStatus({ value, reason });
  }

  public static notValidated(): ValidationStatus {
    return new ValidationStatus({ value: ValidationStatusType.NOT_VALIDATED });
  }

  public static passed(): ValidationStatus {
    return new ValidationStatus({ value: ValidationStatusType.PASSED });
  }

  public static failed(reason: string): ValidationStatus {
    this.validateReason(reason);
    if (!reason || reason.trim().length === 0) {
        throw new Error("Reason is mandatory for FAILED validation status.");
    }
    return new ValidationStatus({ value: ValidationStatusType.FAILED, reason: reason.trim() });
  }

  public value(): ValidationStatusType {
    return this.props.value;
  }

  public reason(): string | undefined {
    return this.props.reason;
  }

  public isPassed(): boolean {
    return this.props.value === ValidationStatusType.PASSED;
  }

  public isFailed(): boolean {
    return this.props.value === ValidationStatusType.FAILED;
  }

  public isNotValidated(): boolean {
    return this.props.value === ValidationStatusType.NOT_VALIDATED;
  }

  public toString(): string {
    if (this.props.reason) {
      return `${this.props.value} (Reason: ${this.props.reason})`;
    }
    return this.props.value;
  }
}
