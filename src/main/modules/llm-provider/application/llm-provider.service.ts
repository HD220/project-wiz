import { LlmProviderRepository } from "../persistence/llm-provider.repository";
import { LlmProvider } from "../domain/llm-provider.entity";
import { LlmProviderMapper } from "../llm-provider.mapper";
import type {
  CreateLlmProviderDto,
  UpdateLlmProviderDto,
  LlmProviderFilterDto
} from "../../../shared/types/llm-provider.types";

export class LlmProviderService {
  constructor(
    private repository: LlmProviderRepository,
    private mapper: LlmProviderMapper,
  ) {}

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

    const saved = await this.repository.save({
      name: data.name,
      provider: data.provider,
      model: data.model,
      apiKey: data.apiKey,
    });

    return this.mapper.toDomain(saved);
  }

  async listLlmProviders(filter?: LlmProviderFilterDto): Promise<LlmProvider[]> {
    const schemas = await this.repository.findMany(filter);
    return schemas.map(schema => this.mapper.toDomain(schema));
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

    const updated = await this.repository.update(data.id, data);
    return this.mapper.toDomain(updated);
  }

  async deleteLlmProvider(id: string): Promise<void> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new Error("LLM provider not found");
    }

    await this.repository.delete(id);
  }
}
