import { z } from 'zod';

import { AbstractValueObject, ValueObjectProps } from '@/core/common/value-objects/base.vo';
import { ValueError } from '@/core/domain/common/common-domain.errors';

const MAX_LENGTH = 2000;

const PersonaBackstorySchema = z.string()
  .max(MAX_LENGTH, `Persona backstory must be at most ${MAX_LENGTH} characters long.`);

interface PersonaBackstoryProps extends ValueObjectProps {
  value: string;
}

export class PersonaBackstory extends AbstractValueObject<PersonaBackstoryProps> {
  private constructor(props: PersonaBackstoryProps) {
    super(props);
  }

  public static create(backstory: string): PersonaBackstory {
    const validationResult = PersonaBackstorySchema.safeParse(backstory);
    if (!validationResult.success) {
      const errorMessages = Object.values(validationResult.error.flatten().fieldErrors).flat().join('; ');
      throw new ValueError(`Invalid persona backstory: ${errorMessages}`, {
        details: validationResult.error.flatten().fieldErrors,
      });
    }
    return new PersonaBackstory({ value: validationResult.data });
  }

  public get value(): string {
    return this.props.value;
  }

  public equals(vo?: PersonaBackstory): boolean {
    return super.equals(vo);
  }

  public toString(): string {
    return this.props.value;
  }
}
