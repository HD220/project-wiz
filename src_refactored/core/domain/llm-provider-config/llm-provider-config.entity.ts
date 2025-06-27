// src_refactored/core/domain/llm-provider-config/llm-provider-config.entity.ts
import { LLMApiKey } from './value-objects/llm-api-key.vo';
import { LLMProviderConfigId } from './value-objects/llm-provider-config-id.vo';
import { LLMProviderConfigName } from './value-objects/llm-provider-config-name.vo';
import { LLMProviderId } from './value-objects/llm-provider-id.vo';

// Interface for optional base URL, could be a VO too if complex validation needed.
export class BaseUrl {
  private readonly _value: string;
  private constructor(value: string) {
    // Basic validation for URL format
    try {
      new URL(value);
    } catch (e) {
      throw new Error('Invalid Base URL format.');
    }
    this._value = value;
  }
  public static create(value: string): BaseUrl {
    return new BaseUrl(value);
  }
  public value(): string {
    return this._value;
  }
  public equals(other?: BaseUrl): boolean {
    return other instanceof BaseUrl && this._value === other._value;
  }
}


interface LLMProviderConfigProps {
  id: LLMProviderConfigId;
  name: LLMProviderConfigName;
  providerId: LLMProviderId; // e.g., 'openai', 'deepseek'
  apiKey: LLMApiKey;
  baseUrl?: BaseUrl; // Optional custom base URL for the API
  // otherOptions?: Record<string, any>; // For provider-specific settings
  // createdAt: Date;
  // updatedAt: Date;
}

export class LLMProviderConfig {
  private readonly _id: LLMProviderConfigId;
  private readonly props: Readonly<Omit<LLMProviderConfigProps, 'id'>>;

  private constructor(props: LLMProviderConfigProps) {
    this._id = props.id;
    const { id, ...otherProps } = props;
    this.props = Object.freeze(otherProps);
  }

  public static create(props: {
    id?: LLMProviderConfigId;
    name: LLMProviderConfigName;
    providerId: LLMProviderId;
    apiKey: LLMApiKey;
    baseUrl?: BaseUrl;
    // otherOptions?: Record<string, any>;
  }): LLMProviderConfig {
    const configId = props.id || LLMProviderConfigId.generate();
    return new LLMProviderConfig({
      id: configId,
      name: props.name,
      providerId: props.providerId,
      apiKey: props.apiKey, // The APIKey VO is passed directly
      baseUrl: props.baseUrl,
      // otherOptions: props.otherOptions || {},
      // createdAt: new Date(),
      // updatedAt: new Date(),
    });
  }

  public id(): LLMProviderConfigId {
    return this._id;
  }

  public name(): LLMProviderConfigName {
    return this.props.name;
  }

  public providerId(): LLMProviderId {
    return this.props.providerId;
  }

  // This method allows controlled access to the API key for internal use by LLM adapters/services.
  // It should not be called casually.
  public apiKeyForAdapter(): string {
    return this.props.apiKey.forHeader(); // Use the controlled access method from LLMApiKey
  }

  public baseUrl(): BaseUrl | undefined {
    return this.props.baseUrl;
  }

  // public otherOptions(): Record<string, any> {
  //   return { ...this.props.otherOptions }; // Return a copy
  // }

  public equals(other?: LLMProviderConfig): boolean {
    if (other === null || other === undefined) {
      return false;
    }
    if (!(other instanceof LLMProviderConfig)) {
      return false;
    }
    return this._id.equals(other._id);
  }

  // Example update methods, returning new instances
  public changeName(newName: LLMProviderConfigName): LLMProviderConfig {
    return new LLMProviderConfig({
      ...this.props,
      id: this._id,
      name: newName,
      // updatedAt: new Date(),
    });
  }

  public changeApiKey(newApiKey: LLMApiKey): LLMProviderConfig {
    return new LLMProviderConfig({
      ...this.props,
      id: this._id,
      apiKey: newApiKey,
      // updatedAt: new Date(),
    });
  }

  public changeBaseUrl(newBaseUrl?: BaseUrl): LLMProviderConfig {
    return new LLMProviderConfig({
      ...this.props,
      id: this._id,
      baseUrl: newBaseUrl,
      // updatedAt: new Date(),
    });
  }
}
