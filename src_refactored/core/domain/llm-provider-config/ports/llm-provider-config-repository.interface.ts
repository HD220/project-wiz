// src_refactored/core/domain/llm-provider-config/ports/llm-provider-config-repository.interface.ts
import { Result } from '../../../../shared/result';
import { LLMProviderConfig } from '../llm-provider-config.entity';
import { LLMProviderConfigId } from '../value-objects/llm-provider-config-id.vo';
import { LLMProviderId } from '../value-objects/llm-provider-id.vo';

export interface ILLMProviderConfigRepository {
  save(config: LLMProviderConfig): Promise<Result<void>>;
  findById(id: LLMProviderConfigId): Promise<Result<LLMProviderConfig | null>>;
  findByProviderId(providerId: LLMProviderId): Promise<Result<LLMProviderConfig[]>>; // A provider might have multiple named configs
  findAll(): Promise<Result<LLMProviderConfig[]>>;
  delete(id: LLMProviderConfigId): Promise<Result<void>>;
}
