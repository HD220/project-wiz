import { LlmProvider } from "./domain/llm-provider.entity";
import type { LlmProviderDto } from "../../../shared/types/llm-provider.types";
import type { LlmProviderSchema } from "./persistence/schema";

export class LlmProviderMapper {
  toDomain(schema: LlmProviderSchema): LlmProvider {
    return new LlmProvider(
      schema.id,
      schema.name,
      schema.provider,
      schema.model,
      schema.apiKey,
      schema.isDefault ?? false,
      schema.createdAt,
      schema.updatedAt,
    );
  }

  toDto(entity: LlmProvider): LlmProviderDto {
    return {
      id: entity.id,
      name: entity.name,
      provider: entity.provider,
      model: entity.model,
      apiKey: entity.apiKey,
      isDefault: entity.isDefault,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }

  schemaToDtoFast(schema: LlmProviderSchema): LlmProviderDto {
    return {
      id: schema.id,
      name: schema.name,
      provider: schema.provider,
      model: schema.model,
      apiKey: schema.apiKey,
      isDefault: schema.isDefault ?? false,
      createdAt: schema.createdAt,
      updatedAt: schema.updatedAt,
    };
  }
}
