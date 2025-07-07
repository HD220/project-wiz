import { injectable } from "inversify";

import { NotFoundError } from "@/core/domain/common/common-domain.errors";
import { LLMProviderConfig } from "@/core/domain/llm-provider-config/llm-provider-config.entity";
import { ILLMProviderConfigRepository } from "@/core/domain/llm-provider-config/ports/llm-provider-config-repository.interface";
import { LLMProviderConfigId } from "@/core/domain/llm-provider-config/value-objects/llm-provider-config-id.vo";
import { LLMProviderId } from "@/core/domain/llm-provider-config/value-objects/llm-provider-id.vo";

@injectable()
export class InMemoryLLMProviderConfigRepository
  implements ILLMProviderConfigRepository
{
  private readonly configs: Map<string, LLMProviderConfig> = new Map();

  async save(config: LLMProviderConfig): Promise<LLMProviderConfig> {
    this.configs.set(config.id.value, config);
    return config;
  }

  async findById(
    id: LLMProviderConfigId
  ): Promise<LLMProviderConfig | null> {
    const config = this.configs.get(id.value);
    return config || null;
  }

  async findByProviderId(
    providerId: LLMProviderId
  ): Promise<LLMProviderConfig[]> {
    const foundConfigs = Array.from(this.configs.values()).filter((config) =>
      config.providerId.equals(providerId)
    );
    return foundConfigs;
  }

  async findAll(): Promise<LLMProviderConfig[]> {
    return Array.from(this.configs.values());
  }

  async delete(id: LLMProviderConfigId): Promise<void> {
    if (!this.configs.has(id.value)) {
      throw new NotFoundError("LLMProviderConfig", id.value);
    }
    this.configs.delete(id.value);
  }
}