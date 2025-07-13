import { LlmProviderEntity } from "../entities/llm-provider.entity";
import type { LlmProviderDto } from "../../../shared/types/llm-provider.types";
import type { LlmProviderData } from "../entities/llm-provider.schema";

export class LlmProviderMapper {
  toDto(entity: LlmProviderEntity): LlmProviderDto {
    const data = entity.toPlainObject();
    return {
      id: data.id,
      name: data.name,
      provider: data.provider,
      model: data.model,
      apiKey: data.apiKey,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  }

  toDtoFromData(data: LlmProviderData): LlmProviderDto {
    return {
      id: data.id,
      name: data.name,
      provider: data.provider,
      model: data.model,
      apiKey: data.apiKey,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  }
}
