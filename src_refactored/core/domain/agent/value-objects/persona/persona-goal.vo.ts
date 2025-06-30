// src_refactored/core/domain/agent/value-objects/persona/persona-goal.vo.ts
import { AbstractValueObject, ValueObjectProps } from '@/core/common/value-objects/base.vo';

interface PersonaGoalProps extends ValueObjectProps {
  value: string;
}

export class PersonaGoal extends AbstractValueObject<PersonaGoalProps> {
  private static readonly MIN_LENGTH = 10;
  private static readonly MAX_LENGTH = 500;

  private constructor(value: string) {
    super({ value });
  }

  private static validate(goal: string): void {
    if (goal.trim().length < this.MIN_LENGTH) {
      throw new Error(`Persona goal must be at least ${this.MIN_LENGTH} characters long.`);
    }
    if (goal.length > this.MAX_LENGTH) {
      throw new Error(`Persona goal must be at most ${this.MAX_LENGTH} characters long.`);
    }
  }

  public static create(goal: string): PersonaGoal {
    this.validate(goal);
    return new PersonaGoal(goal.trim());
  }

  public value(): string {
    return this.props.value;
  }

  public toString(): string {
    return this.props.value;
  }
}
