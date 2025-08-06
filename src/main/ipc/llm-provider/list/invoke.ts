import { z } from "zod";
import { listLlmProviders } from "@/main/ipc/llm-provider/queries";
import { LlmProviderSchema } from "@/shared/types";
import { requireAuth } from "@/main/services/session-registry";
import { getLogger } from "@/shared/services/logger/config";
import { createIPCHandler, InferHandler } from "@/shared/utils/create-ipc-handler";

const logger = getLogger("llm-provider.list.invoke");

const ListLlmProvidersInputSchema = z.object({
  type: z.enum(["openai", "deepseek", "anthropic", "google", "custom"]).optional(),
  search: z.string().optional(),
  showInactive: z.boolean().optional().default(false),
}).optional().default({});

const ListLlmProvidersOutputSchema = z.array(LlmProviderSchema);

const handler = createIPCHandler({
  inputSchema: ListLlmProvidersInputSchema,
  outputSchema: ListLlmProvidersOutputSchema,
  handler: async (filters = {}) => {
    logger.debug("Listing LLM providers");

    const currentUser = requireAuth();
    
    // List providers with ownership validation
    const dbProviders = await listLlmProviders({
      ownerId: currentUser.id,
      type: filters.type,
      search: filters.search,
      showInactive: filters.showInactive || false,
    });
    
    // Mapeamento: SelectLlmProvider[] → LlmProvider[]
    const apiProviders = dbProviders.map(provider => ({
      id: provider.id,
      ownerId: provider.ownerId,
      name: provider.name,
      type: provider.type,
      apiKey: provider.apiKey,
      baseUrl: provider.baseUrl,
      defaultModel: provider.defaultModel,
      isDefault: provider.isDefault,
      isActive: provider.isActive,
      createdAt: new Date(provider.createdAt),
      updatedAt: new Date(provider.updatedAt),
    }));
    
    logger.debug("Listed LLM providers", { count: apiProviders.length });
    
    return apiProviders;
  }
});

export default handler;

declare global {
  namespace WindowAPI {
    interface LlmProvider {
      list: InferHandler<typeof handler>
    }
  }
}