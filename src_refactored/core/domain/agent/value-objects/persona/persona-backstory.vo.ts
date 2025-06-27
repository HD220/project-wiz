// src_refactored/core/domain/agent/value-objects/persona/persona-backstory.vo.ts
import { AbstractValueObject, ValueObjectProps } from '@/core/common/value-objects/base.vo';

interface PersonaBackstoryProps extends ValueObjectProps {
  value: string;
}

export class PersonaBackstory extends AbstractValueObject<PersonaBackstoryProps> {
  private static readonly MAX_LENGTH = 2000; // Allow for a more detailed backstory

  private constructor(value: string) {
    super({ value });
  }

  private static validate(backstory: string): void {
    // Backstory can be empty if not provided
    if (backstory.length > this.MAX_LENGTH) {
      throw new Error(`Persona backstory must be at most ${this.MAX_LENGTH} characters long.`);
    }
  }

  public static create(backstory: string): PersonaBackstory {
    this.validate(backstory);
    return new PersonaBackstory(backstory); // Not trimming, to preserve formatting if any
  }

  public value(): string {
    return this.props.value;
  }

  public toString(): string {
    return this.props.value;
  }
}
