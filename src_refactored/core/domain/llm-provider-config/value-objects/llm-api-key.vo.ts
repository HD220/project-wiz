import { z } from 'zod';

import { AbstractValueObject, ValueObjectProps } from '@/core/common/value-objects/base.vo';
import { ValueError } from '@/core/domain/common/errors';

const LLMApiKeySchema = z.string()
  .trim()
  .min(1, 'API key cannot be empty.');

interface LLMApiKeyProps extends ValueObjectProps {
  value: string;
}

export class LLMApiKey extends AbstractValueObject<LLMApiKeyProps> {
  private constructor(props: LLMApiKeyProps) {
    super(props);
  }

  public static create(apiKey: string): LLMApiKey {
    const validationResult = LLMApiKeySchema.safeParse(apiKey);
    if (!validationResult.success) {
      const errorMessages = Object.values(validationResult.error.flatten().fieldErrors).flat().join('; ');
      throw new ValueError(`Invalid API key: ${errorMessages}`, {
        details: validationResult.error.flatten().fieldErrors,
      });
    }
    return new LLMApiKey({ value: validationResult.data });
  }

  public get value(): string {
    return this.props.value;
  }

  public equals(vo?: LLMApiKey): boolean {
    return super.equals(vo);
  }

  public toString(): string {
    return 'LLMApiKey(**********)';
  }
}
