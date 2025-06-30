// src_refactored/core/domain/llm-provider-config/value-objects/llm-provider-id.vo.ts
import { AbstractValueObject, ValueObjectProps } from '../../../../core/common/value-objects/base.vo';

interface LLMProviderIdProps extends ValueObjectProps {
  value: string;
}

const ALLOWED_PROVIDER_IDS = ['openai', 'deepseek', 'anthropic', 'ollama', 'mock'];

export class LLMProviderId extends AbstractValueObject<LLMProviderIdProps> {
  private constructor(value: string) {
    super({ value });
  }

  private static validate(providerId: string): void {
    if (!providerId || providerId.trim().length === 0) {
      throw new Error('LLMProviderId cannot be empty.');
    }
    if (!ALLOWED_PROVIDER_IDS.includes(providerId.toLowerCase())) {
      // In a real app, this might come from a registry or config
      // For now, simple hardcoded list for basic validation
      // Consider making this check optional or configurable if new providers can be added dynamically
      // without code changes. For now, it acts as a known set.
      // throw new Error(`Unsupported LLMProviderId: ${providerId}. Allowed: ${ALLOWED_PROVIDER_IDS.join(', ')}`);
      // Softening this validation for now, as the list of providers might expand via config.
      // The main check will be if a corresponding adapter/service exists for this ID.
      console.warn(`LLMProviderId: '${providerId}' is not in the predefined list. Ensure an adapter exists.`);
    }
    // Validate format if necessary (e.g., lowercase, no spaces)
    if (providerId !== providerId.toLowerCase() || providerId.includes(' ')) {
        throw new Error('LLMProviderId should be lowercase and contain no spaces.');
    }
  }

  public static create(providerId: string): LLMProviderId {
    const trimmedId = providerId.trim();
    this.validate(trimmedId);
    return new LLMProviderId(trimmedId);
  }

  public value(): string {
    return this.props.value;
  }

  public toString(): string {
    return this.props.value;
  }
}
