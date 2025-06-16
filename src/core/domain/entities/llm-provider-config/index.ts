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
export class LLMProviderConfig {
  constructor(private readonly fields: LLMProviderConfigConstructor) {}

  get id() {
    return this.fields.id;
  }

  get name() {
    return this.fields.name;
  }
  get llmProvider() {
    return this.fields.llmProvider;
  }
  get model() {
    return this.fields.model;
  }
  get apiKey() {
    return this.fields.apiKey;
  }
}
