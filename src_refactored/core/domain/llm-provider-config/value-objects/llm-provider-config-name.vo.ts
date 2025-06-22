// src_refactored/core/domain/llm-provider-config/value-objects/llm-provider-config-name.vo.ts
import { AbstractValueObject, ValueObjectProps } from '../../../../core/common/value-objects/base.vo';

interface LLMProviderConfigNameProps extends ValueObjectProps {
  value: string;
}

export class LLMProviderConfigName extends AbstractValueObject<LLMProviderConfigNameProps> {
  private static readonly MIN_LENGTH = 1;
  private static readonly MAX_LENGTH = 100;

  private constructor(value: string) {
    super({ value });
  }

  private static validate(name: string): void {
    if (name.trim().length < this.MIN_LENGTH) {
      throw new Error(`LLMProviderConfig name must be at least ${this.MIN_LENGTH} character long.`);
    }
    if (name.length > this.MAX_LENGTH) {
      throw new Error(`LLMProviderConfig name must be at most ${this.MAX_LENGTH} characters long.`);
    }
  }

  public static create(name: string): LLMProviderConfigName {
    this.validate(name);
    return new LLMProviderConfigName(name.trim());
  }

  public value(): string {
    return this.props.value;
  }

  public toString(): string {
    return this.props.value;
  }
}
