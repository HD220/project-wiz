// src_refactored/core/domain/annotation/value-objects/annotation-id.vo.ts
import { Identity } from '@/core/common/value-objects/identity.vo';

export class AnnotationId extends Identity {
  private constructor(value: string) {
    super(value); // Identity constructor calls its own static validate
  }

  public static generate(): AnnotationId {
    return new AnnotationId(super.generate().value());
  }

  public static fromString(value: string): AnnotationId {
    // Validation is handled by the Identity constructor via super(value)
    return new AnnotationId(value);
  }

  // The `value()` method is inherited from Identity
  // The `equals()` method is inherited from AbstractValueObject via Identity
}
