// src_refactored/core/domain/source-code/value-objects/repository-id.vo.ts
import { Identity } from '@/core/common/value-objects/identity.vo';

export class RepositoryId extends Identity {
  private constructor(value: string) {
    super(value);
  }

  public static generate(): RepositoryId {
    return new RepositoryId(super.generate().value);
  }

  public static fromString(value: string): RepositoryId {
    // Validation is handled by the parent Identity class constructor
    return new RepositoryId(value);
  }

  // Inherits value() and equals() from Identity and AbstractValueObject
}
