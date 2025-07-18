// CRUD Consolidation Pattern - All operations in one place
export {
  createLlmProvider,
  findLlmProviderById,
  findLlmProviderByName,
  findAllLlmProviders,
  findDefaultLlmProvider,
  updateLlmProvider,
  deleteLlmProvider,
  setDefaultLlmProvider,
} from "./llm-provider-crud.functions";

// Factory and mapping functions
export { llmProviderToDto } from "./llm-provider.mapper";
export type { LlmProviderWithData } from "./llm-factory.functions";

// Legacy compatibility (deprecated - use llm-provider-crud.functions)
export { createLlmProvider as createLlmProviderLegacy } from "./llm-create.functions";
export {
  findLlmProviderById as findLlmProviderByIdLegacy,
  findLlmProviderByName as findLlmProviderByNameLegacy,
  findAllLlmProviders as findAllLlmProvidersLegacy,
} from "./llm-query.functions";
export {
  updateLlmProvider as updateLlmProviderLegacy,
  deleteLlmProvider as deleteLlmProviderLegacy,
} from "./llm-update.functions";
export {
  setDefaultLlmProvider as setDefaultLlmProviderLegacy,
  findDefaultLlmProvider as findDefaultLlmProviderLegacy,
} from "./llm-provider-operations.functions";
