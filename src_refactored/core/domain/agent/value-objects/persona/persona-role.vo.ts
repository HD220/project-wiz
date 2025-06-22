// src_refactored/core/domain/agent/value-objects/persona/persona-role.vo.ts
import { AbstractValueObject, ValueObjectProps } from '../../../../../core/common/value-objects/base.vo';

interface PersonaRoleProps extends ValueObjectProps {
  value: string;
}

export class PersonaRole extends AbstractValueObject<PersonaRoleProps> {
  private static readonly MIN_LENGTH = 3;
  private static readonly MAX_LENGTH = 50;

  private constructor(value: string) {
    super({ value });
  }

  private static validate(role: string): void {
    if (role.trim().length < this.MIN_LENGTH) {
      throw new Error(`Persona role must be at least ${this.MIN_LENGTH} characters long.`);
    }
    if (role.length > this.MAX_LENGTH) {
      throw new Error(`Persona role must be at most ${this.MAX_LENGTH} characters long.`);
    }
    // Could add regex for allowed characters if needed
  }

  public static create(role: string): PersonaRole {
    this.validate(role);
    return new PersonaRole(role.trim());
  }

  public value(): string {
    return this.props.value;
  }

  public toString(): string {
    return this.props.value;
  }
}
