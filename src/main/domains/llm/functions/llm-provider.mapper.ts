import type { LlmProviderWithData } from "./llm-provider-operations.functions";
import type { LlmProviderDto } from "../../../../shared/types";

export function llmProviderToDto(
  provider: LlmProviderWithData,
): LlmProviderDto {
  return {
    id: provider.id,
    name: provider.name,
    provider: provider.provider,
    model: provider.model,
    apiKey: provider.apiKey,
    isDefault: provider.isDefault,
    createdAt: provider.createdAt,
    updatedAt: provider.updatedAt,
  };
}
