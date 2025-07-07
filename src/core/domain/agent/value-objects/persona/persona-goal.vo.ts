import { z } from 'zod';

import { AbstractValueObject, ValueObjectProps } from '@/core/common/value-objects/base.vo';
import { ValueError } from '@/core/domain/common/common-domain.errors';

const MIN_LENGTH = 10;
const MAX_LENGTH = 500;

const PersonaGoalSchema = z.string()
  .trim()
  .min(MIN_LENGTH, `Persona goal must be at least ${MIN_LENGTH} characters long.`)
  .max(MAX_LENGTH, `Persona goal must be at most ${MAX_LENGTH} characters long.`);

interface PersonaGoalProps extends ValueObjectProps {
  value: string;
}

export class PersonaGoal extends AbstractValueObject<PersonaGoalProps> {
  private constructor(props: PersonaGoalProps) {
    super(props);
  }

  public static create(goal: string): PersonaGoal {
    const validationResult = PersonaGoalSchema.safeParse(goal);
    if (!validationResult.success) {
      const errorMessages = Object.values(validationResult.error.flatten().fieldErrors).flat().join('; ');
      throw new ValueError(`Invalid persona goal: ${errorMessages}`, {
        details: validationResult.error.flatten().fieldErrors,
      });
    }
    return new PersonaGoal({ value: validationResult.data });
  }

  public get value(): string {
    return this.props.value;
  }

  public equals(vo?: PersonaGoal): boolean {
    return super.equals(vo);
  }

  public toString(): string {
    return this.props.value;
  }
}

