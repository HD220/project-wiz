// src_refactored/infrastructure/persistence/in-memory/repositories/llm-provider-config.repository.ts
import { injectable } from 'inversify';

import { LLMProviderConfig } from '@/core/domain/llm-provider-config/llm-provider-config.entity';
import { ILLMProviderConfigRepository } from '@/core/domain/llm-provider-config/ports/llm-provider-config-repository.interface';
import { LLMProviderConfigId } from '@/core/domain/llm-provider-config/value-objects/llm-provider-config-id.vo';

import { Result, Ok, Err } from '@/shared/result';


@injectable()
export class InMemoryLLMProviderConfigRepository implements ILLMProviderConfigRepository {
  private readonly configs: Map<string, LLMProviderConfig> = new Map();

  async save(config: LLMProviderConfig): Promise<Result<void, Error>> {
    this.configs.set(config.id.value, config);
    return Ok(undefined);
  }

  async findById(id: LLMProviderConfigId): Promise<Result<LLMProviderConfig | null, Error>> {
    const config = this.configs.get(id.value);
    return Ok(config || null);
  }

  async findByProvider(provider: string): Promise<Result<LLMProviderConfig | null, Error>> {
    for (const config of this.configs.values()) {
      if (config.providerName.value === provider) { // Assuming providerName is a VO with a value property
        return Ok(config);
      }
    }
    return Ok(null);
  }

  async findAll(): Promise<Result<LLMProviderConfig[], Error>> {
    return Ok(Array.from(this.configs.values()));
  }

  async delete(id: LLMProviderConfigId): Promise<Result<void, Error>> {
    if (!this.configs.has(id.value)) {
      return Err(new Error(`LLMProviderConfig with ID ${id.value} not found.`));
    }
    this.configs.delete(id.value);
    return Ok(undefined);
  }
}
