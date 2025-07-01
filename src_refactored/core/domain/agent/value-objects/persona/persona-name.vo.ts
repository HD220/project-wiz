// src_refactored/core/domain/agent/value-objects/persona/persona-name.vo.ts
import { AbstractValueObject, ValueObjectProps } from '@/core/common/value-objects/base.vo';

interface PersonaNameProps extends ValueObjectProps {
  value: string;
}

export class PersonaName extends AbstractValueObject<PersonaNameProps> {
  private static readonly MIN_LENGTH = 1;
  private static readonly MAX_LENGTH = 100;

  private constructor(value: string) {
    super({ value });
  }

  private static validate(name: string): void {
    if (name.trim().length < this.MIN_LENGTH) {
      throw new Error(`Persona name must be at least ${this.MIN_LENGTH} character long.`);
    }
    if (name.length > this.MAX_LENGTH) {
      throw new Error(`Persona name must be at most ${this.MAX_LENGTH} characters long.`);
    }
  }

  public static create(name: string): PersonaName {
    this.validate(name);
    return new PersonaName(name.trim());
  }

  public value(): string {
    return this.props.value;
  }

  public toString(): string {
    return this.props.value;
  }
}
