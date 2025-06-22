// src_refactored/core/common/value-objects/identity.vo.ts
import { randomUUID } from 'crypto';
import { AbstractValueObject, ValueObjectProps } from './base.vo';

// Define Zod schema for UUID validation
// For simplicity in this step, direct validation is used. Zod could be reintroduced later if complex validation needed.
const UUID_REGEX = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

interface IdentityProps extends ValueObjectProps {
  value: string;
}

export class Identity extends AbstractValueObject<IdentityProps> {
  protected constructor(value: string) {
    Identity.validate(value);
    super({ value });
  }

  private static validate(value: string): void {
    if (!UUID_REGEX.test(value)) {
      // In a real application, throw a custom DomainError or ValidationError
      throw new Error(`Invalid UUID format: ${value}`);
    }
  }

  public static generate(): Identity {
    return new Identity(randomUUID());
  }

  public static fromString(value: string): Identity {
    return new Identity(value);
  }

  // To satisfy Object Calisthenics (avoiding direct getter `getValue()`)
  // we provide a method that returns its string representation.
  // This can be named `value()` or `toStringValue()` or `idString()`.
  // For simplicity and common understanding with IDs, `value()` is chosen here.
  public value(): string {
    return this.props.value;
  }

  // Override toString for easier debugging or logging if needed,
  // but primary access should be via `value()`.
  public toString(): string {
    return this.props.value;
  }

  // The `equals` method is inherited from AbstractValueObject
}
