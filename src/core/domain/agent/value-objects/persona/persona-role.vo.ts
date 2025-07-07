import { z } from 'zod';

import { AbstractValueObject, ValueObjectProps } from '@/core/common/value-objects/base.vo';
import { ValueError } from '@/core/domain/common/common-domain.errors';

const MIN_LENGTH = 3;
const MAX_LENGTH = 50;

const PersonaRoleSchema = z.string()
  .trim()
  .min(MIN_LENGTH, `Persona role must be at least ${MIN_LENGTH} characters long.`)
  .max(MAX_LENGTH, `Persona role must be at most ${MAX_LENGTH} characters long.`);

interface PersonaRoleProps extends ValueObjectProps {
  value: string;
}

export class PersonaRole extends AbstractValueObject<PersonaRoleProps> {
  private constructor(props: PersonaRoleProps) {
    super(props);
  }

  public static create(role: string): PersonaRole {
    const validationResult = PersonaRoleSchema.safeParse(role);
    if (!validationResult.success) {
      const errorMessages = Object.values(validationResult.error.flatten().fieldErrors).flat().join('; ');
      throw new ValueError(`Invalid persona role: ${errorMessages}`, {
        details: validationResult.error.flatten().fieldErrors,
      });
    }
    return new PersonaRole({ value: validationResult.data });
  }

  public get value(): string {
    return this.props.value;
  }

  public equals(vo?: PersonaRole): boolean {
    return super.equals(vo);
  }

  public toString(): string {
    return this.props.value;
  }
}

