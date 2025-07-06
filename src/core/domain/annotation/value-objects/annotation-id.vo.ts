// src/core/domain/annotation/value-objects/annotation-id.vo.ts
import { Identity } from "@/core/common/value-objects/identity.vo";

export class AnnotationId extends Identity {
  private constructor(value: string) {
    super(value);
  }

  public static generate(): AnnotationId {
    return new AnnotationId(super.generate().value);
  }

  public static fromString(value: string): AnnotationId {
    return new AnnotationId(value);
  }
}
