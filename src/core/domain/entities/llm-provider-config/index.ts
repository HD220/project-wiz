import { LLMModel } from "../llm-model";
import { LLMProvider } from "../llm-provider";
import {
  LLMProviderConfigApiKey,
  LLMProviderConfigId,
  LLMProviderConfigName,
} from "./value-objects";

export type LLMProviderConfigConstructor = {
  id: LLMProviderConfigId;
  name: LLMProviderConfigName;
  llmProvider: LLMProvider;
  model: LLMModel;
  apiKey: LLMProviderConfigApiKey;
};

// TODO: OBJECT_CALISTHENICS_REFACTOR: This class is undergoing refactoring.
// The `getProps()` method is a temporary measure for external consumers.
// Ideally, direct state access will be replaced by more behavior-oriented methods.
export class LLMProviderConfig {
  private constructor(private readonly fields: LLMProviderConfigConstructor) { // Changed to private
    // Validation can remain here, called by the static create method.
    if (
      !fields.id ||
      !fields.name ||
      !fields.llmProvider ||
      !fields.model ||
      !fields.apiKey
    ) {
      throw new Error( // Consider DomainError from "@/core/common/errors"
        "LLMProviderConfig ID, Name, LLMProvider, Model, and APIKey are mandatory."
      );
    }
  }

  public static create(props: LLMProviderConfigConstructor): LLMProviderConfig {
    // Basic validation for presence of required fields.
    // Individual VOs are already validated by their own .create() methods.
    if (!props.id || !props.name || !props.llmProvider || !props.model || !props.apiKey) {
        throw new Error("Missing required fields for LLMProviderConfig creation."); // Consider DomainError
    }
    return new LLMProviderConfig(props);
  }

  public id(): LLMProviderConfigId {
    return this.fields.id;
  }

  public getProps(): Readonly<LLMProviderConfigConstructor> {
    // LLMProvider and LLMModel are entities; returning them directly is okay
    // as their state is also managed via VOs / getProps.
    return { ...this.fields };
  }

  // Individual getters removed.

  public equals(other?: LLMProviderConfig): boolean {
    if (this === other) return true;
    if (!other || !(other instanceof LLMProviderConfig)) return false;

    return (
      this.fields.id.equals(other.fields.id) &&
      this.fields.name.equals(other.fields.name) &&
      this.fields.llmProvider.equals(other.fields.llmProvider) && // Assumes LLMProvider has .equals()
      this.fields.model.equals(other.fields.model) && // Assumes LLMModel has .equals()
      this.fields.apiKey.equals(other.fields.apiKey)
    );
  }
}
