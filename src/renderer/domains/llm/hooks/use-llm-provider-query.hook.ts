import { createEntityQueryHooks } from "../../../hooks/use-query-factory.hook";
import { llmProviderService } from "../services/llm-provider.service";

import type { LlmProviderFilterDto } from "../../../../shared/types/domains/llm/llm-provider.types";

// Criação automática dos hooks usando o factory
const llmProviderQueryHooks = createEntityQueryHooks<any, LlmProviderFilterDto>(
  "llmProvider",
  llmProviderService,
);

// Exportação dos hooks com nomes específicos para LLM providers
export const useLlmProvidersQuery = llmProviderQueryHooks.useListQuery;
export const useLlmProviderQuery = llmProviderQueryHooks.useByIdQuery;
export const useDefaultLlmProviderQuery =
  llmProviderQueryHooks.useDefaultQuery!;
