import { LLMProviderConfig } from "../llm-provider-config.entity";
import { LLMProviderConfigId } from "../value-objects/llm-provider-config-id.vo";
import { LLMProviderId } from "../value-objects/llm-provider-id.vo";

export interface ILLMProviderConfigRepository {
  save(config: LLMProviderConfig): Promise<LLMProviderConfig>;
  findById(id: LLMProviderConfigId): Promise<LLMProviderConfig | null>;
  findByProviderId(providerId: LLMProviderId): Promise<LLMProviderConfig[]>;
  findAll(): Promise<LLMProviderConfig[]>;
  delete(id: LLMProviderConfigId): Promise<void>;
}