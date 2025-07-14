import { LlmProvider } from "../domain/llm-provider.entity";
import { LlmProviderMapper } from "../llm-provider.mapper";
import { LlmProviderRepository } from "../persistence/llm-provider.repository";

import { EncryptionService } from "./encryption.service";

import type {
  CreateLlmProviderDto,
  UpdateLlmProviderDto,
  LlmProviderFilterDto,
} from "../../../../shared/types/llm-provider.types";

export class LlmProviderService {
  private encryptionService: EncryptionService;

  constructor(
    private repository: LlmProviderRepository,
    private mapper: LlmProviderMapper,
  ) {
    this.encryptionService = new EncryptionService();
  }

  async createLlmProvider(data: CreateLlmProviderDto): Promise<LlmProvider> {
    if (!LlmProvider.validateName(data.name)) {
      throw new Error("Invalid LLM provider name");
    }

    const existing = await this.repository.findMany({
      name: data.name,
    });

    if (existing.length > 0) {
      throw new Error("An LLM provider with this name already exists");
    }

    // Encrypt the API key before storing
    const encryptedApiKey = this.encryptionService.encrypt(data.apiKey);

    const saved = await this.repository.save({
      name: data.name,
      provider: data.provider,
      model: data.model,
      apiKey: encryptedApiKey,
    });

    return this.mapper.toDomain(saved);
  }

  async listLlmProviders(
    filter?: LlmProviderFilterDto,
  ): Promise<LlmProvider[]> {
    const schemas = await this.repository.findMany(filter);
    return schemas.map((schema) => this.mapper.toDomain(schema));
  }

  async getLlmProviderById(id: string): Promise<LlmProvider | null> {
    const schema = await this.repository.findById(id);
    return schema ? this.mapper.toDomain(schema) : null;
  }

  async updateLlmProvider(data: UpdateLlmProviderDto): Promise<LlmProvider> {
    const existing = await this.repository.findById(data.id);
    if (!existing) {
      throw new Error("LLM provider not found");
    }

    // Encrypt API key if it's being updated
    const updateData = { ...data };
    if (data.apiKey) {
      updateData.apiKey = this.encryptionService.encrypt(data.apiKey);
    }

    const updated = await this.repository.update(data.id, updateData);
    return this.mapper.toDomain(updated);
  }

  async deleteLlmProvider(id: string): Promise<void> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new Error("LLM provider not found");
    }

    await this.repository.delete(id);
  }

  // Method to get decrypted API key for AI service usage
  async getDecryptedApiKey(id: string): Promise<string> {
    const provider = await this.repository.findById(id);
    if (!provider) {
      throw new Error("LLM provider not found");
    }

    try {
      return this.encryptionService.decrypt(provider.apiKey);
    } catch (error) {
      console.error(`Failed to decrypt API key for provider ${id}:`, error);
      throw new Error("Failed to decrypt API key");
    }
  }

  // Get the default LLM provider
  async getDefaultProvider(): Promise<LlmProvider | null> {
    const schemas = await this.repository.findMany({ isDefault: true });
    return schemas.length > 0 ? this.mapper.toDomain(schemas[0]) : null;
  }

  // Set a provider as default
  async setDefaultProvider(id: string): Promise<LlmProvider> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new Error("LLM provider not found");
    }

    // Remove default flag from other providers
    await this.clearDefaultProvider();

    // Set this provider as default
    const updated = await this.repository.update(id, { isDefault: true });
    return this.mapper.toDomain(updated);
  }

  // Remove default flag from all providers
  private async clearDefaultProvider(): Promise<void> {
    const defaultProviders = await this.repository.findMany({
      isDefault: true,
    });
    for (const provider of defaultProviders) {
      await this.repository.update(provider.id, { isDefault: false });
    }
  }
}
