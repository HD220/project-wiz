// src_refactored/core/domain/project/value-objects/project-id.vo.ts
import { Identity } from '@/core/common/value-objects/identity.vo';

export class ProjectId extends Identity {
  private constructor(value: string) {
    super(value);
  }

  public static generate(): ProjectId {
    return new ProjectId(super.generate().value);
  }

  public static fromString(value: string): ProjectId {
    // Validation is handled by the parent Identity class constructor
    return new ProjectId(value);
  }

  // Inherits value() and equals() from Identity and AbstractValueObject
}
