// src_refactored/core/domain/llm-provider-config/value-objects/llm-api-key.vo.ts
import { AbstractValueObject, ValueObjectProps } from '../../../../core/common/value-objects/base.vo';

interface LLMApiKeyProps extends ValueObjectProps {
  value: string; // The API key itself
}

export class LLMApiKey extends AbstractValueObject<LLMApiKeyProps> {
  // Marked as private to ensure it's only constructed via `create`
  private constructor(value: string) {
    super({ value });
  }

  private static validate(apiKey: string): void {
    if (!apiKey || apiKey.trim().length === 0) {
      throw new Error('API key cannot be empty.');
    }
    // Add more specific validation if patterns are known for certain providers,
    // e.g., length, prefix like "sk-", etc. For now, just non-empty.
  }

  public static create(apiKey: string): LLMApiKey {
    this.validate(apiKey);
    return new LLMApiKey(apiKey); // Store the actual key
  }

  // To comply with "No Getters" for sensitive data like API keys,
  // this method explicitly does not return the key.
  // The key should be used internally by services that need it,
  // passed perhaps during their construction or to a specific method.
  public value(): string {
    throw new Error(
      'API key value should not be directly accessed after creation for security reasons. ' +
      'It should be passed to a service that handles it internally.',
    );
  }

  // This method allows controlled access to the key, e.g., for an HTTP header.
  // The caller is responsible for secure handling.
  public forHeader(): string {
    return this.props.value;
  }

  // toString should also not reveal the key.
  public toString(): string {
    return 'LLMApiKey(**********)'; // Masked
  }

  // equals method is inherited. It will compare actual key values, which is fine
  // for determining if two LLMApiKey objects represent the same key.
}
