// src_refactored/core/domain/agent/value-objects/persona/persona-id.vo.ts
import { Identity } from '@/core/common/value-objects/identity.vo';

export class PersonaId extends Identity {
  private constructor(value: string) {
    super(value);
  }

  public static generate(): PersonaId {
    return new PersonaId(super.generate().value);
  }

  public static fromString(value: string): PersonaId {
    return new PersonaId(value);
  }
}
