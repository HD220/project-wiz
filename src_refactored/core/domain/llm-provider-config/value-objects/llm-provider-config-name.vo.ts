import { z } from 'zod';

import { AbstractValueObject, ValueObjectProps } from '@/core/common/value-objects/base.vo';
import { ValueError } from '@/core/domain/common/errors';

const MIN_LENGTH = 1;
const MAX_LENGTH = 100;

const LLMProviderConfigNameSchema = z.string()
  .trim()
  .min(MIN_LENGTH, `LLMProviderConfig name must be at least ${MIN_LENGTH} character long.`)
  .max(MAX_LENGTH, `LLMProviderConfig name must be at most ${MAX_LENGTH} characters long.`);

interface LLMProviderConfigNameProps extends ValueObjectProps {
  value: string;
}

export class LLMProviderConfigName extends AbstractValueObject<LLMProviderConfigNameProps> {
  private constructor(props: LLMProviderConfigNameProps) {
    super(props);
  }

  public static create(name: string): LLMProviderConfigName {
    const validationResult = LLMProviderConfigNameSchema.safeParse(name);
    if (!validationResult.success) {
      throw new ValueError('Invalid LLMProviderConfig name.', {
        details: validationResult.error.flatten().fieldErrors,
      });
    }
    return new LLMProviderConfigName({ value: validationResult.data });
  }

  public get value(): string {
    return this.props.value;
  }

  public equals(vo?: LLMProviderConfigName): boolean {
    return super.equals(vo);
  }

  public toString(): string {
    return this.props.value;
  }
}

