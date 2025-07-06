import { z } from 'zod';

import { AbstractValueObject, ValueObjectProps } from '@/core/common/value-objects/base.vo';
import { ValueError } from '@/core/domain/common/errors';

const MIN_LENGTH = 1;
const MAX_LENGTH = 100;

const PersonaNameSchema = z.string()
  .trim()
  .min(MIN_LENGTH, `Persona name must be at least ${MIN_LENGTH} character long.`)
  .max(MAX_LENGTH, `Persona name must be at most ${MAX_LENGTH} characters long.`);

interface PersonaNameProps extends ValueObjectProps {
  value: string;
}

export class PersonaName extends AbstractValueObject<PersonaNameProps> {
  private constructor(props: PersonaNameProps) {
    super(props);
  }

  public static create(name: string): PersonaName {
    const validationResult = PersonaNameSchema.safeParse(name);
    if (!validationResult.success) {
      const errorMessages = Object.values(validationResult.error.flatten().fieldErrors).flat().join('; ');
      throw new ValueError(`Invalid persona name: ${errorMessages}`, {
        details: validationResult.error.flatten().fieldErrors,
      });
    }
    return new PersonaName({ value: validationResult.data });
  }

  public get value(): string {
    return this.props.value;
  }

  public equals(vo?: PersonaName): boolean {
    return super.equals(vo);
  }

  public toString(): string {
    return this.props.value;
  }
}
