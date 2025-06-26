// src_refactored/core/domain/user/value-objects/user-id.vo.ts
import { Identity } from '@/core/common/value-objects/identity.vo';

export class UserId extends Identity {
  private constructor(value: string) {
    super(value); // Identity constructor calls its own static validate
  }

  public static generate(): UserId {
    return new UserId(super.generate().value()); // Use super.generate() and get its value
  }

  public static fromString(value: string): UserId {
    // Validation is handled by the Identity constructor via super(value)
    return new UserId(value);
  }

  // The `value()` method is inherited from Identity
  // The `equals()` method is inherited from AbstractValueObject via Identity
}
