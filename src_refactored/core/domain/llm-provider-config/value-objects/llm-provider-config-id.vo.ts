// src_refactored/core/domain/llm-provider-config/value-objects/llm-provider-config-id.vo.ts
import { Identity } from '../../../../core/common/value-objects/identity.vo';

export class LLMProviderConfigId extends Identity {
  private constructor(value: string) {
    super(value);
  }

  public static generate(): LLMProviderConfigId {
    return new LLMProviderConfigId(super.generate().value());
  }

  public static fromString(value: string): LLMProviderConfigId {
    // Validation is handled by the parent Identity class constructor
    return new LLMProviderConfigId(value);
  }
}
