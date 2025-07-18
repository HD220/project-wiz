import { createEntityQueryHooks } from "@/hooks/use-query-factory.hook";

import type {
  LlmProviderDto,
  LlmProviderFilterDto,
} from "@/shared/types/llm/llm-provider.types";

import { llmProviderService } from "../services/llm-provider.service";

// Criação automática dos hooks usando o factory
const llmProviderQueryHooks = createEntityQueryHooks<
  LlmProviderDto,
  LlmProviderFilterDto
>("llmProvider", llmProviderService);

// Exportação dos hooks com nomes específicos para LLM providers
export const useLlmProvidersQuery = llmProviderQueryHooks.useListQuery;
export const useLlmProviderQuery = llmProviderQueryHooks.useByIdQuery;
export const useDefaultLlmProviderQuery =
  llmProviderQueryHooks.useDefaultQuery!;
