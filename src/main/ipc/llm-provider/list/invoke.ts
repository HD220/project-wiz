import { z } from "zod";
import { listLlmProviders } from "@/main/ipc/llm-provider/queries";
import { LlmProviderSchema } from "@/shared/types";
import { requireAuth } from "@/main/services/session-registry";
import { getLogger } from "@/shared/services/logger/config";

const logger = getLogger("llm-provider.list.invoke");

// Input schema - campos de filtro (sem userId que é adicionado automaticamente)
const ListLlmProvidersInputSchema = z.object({
  type: z.enum(["openai", "deepseek", "anthropic", "google", "custom"]).optional(),
  search: z.string().optional(),
  showInactive: z.boolean().optional().default(false),
}).optional();

// Output schema - array de LlmProvider (sem apiKey)
const ListLlmProvidersOutputSchema = z.array(LlmProviderSchema);

type ListLlmProvidersInput = z.infer<typeof ListLlmProvidersInputSchema>;
type ListLlmProvidersOutput = z.infer<typeof ListLlmProvidersOutputSchema>;

export default async function(filters?: ListLlmProvidersInput): Promise<ListLlmProvidersOutput> {
  logger.debug("Listing LLM providers");

  // 1. Validate input
  const validatedInput = filters ? ListLlmProvidersInputSchema.parse(filters) : {};

  // 2. Check authentication
  const currentUser = requireAuth();
  
  // 3. List providers with ownership validation
  const dbProviders = await listLlmProviders({
    ownerId: currentUser.id,
    type: validatedInput.type,
    search: validatedInput.search,
    showInactive: validatedInput.showInactive,
  });
  
  // 4. Map database results to shared types
  const apiProviders = dbProviders.map(provider => ({
    id: provider.id,
    userId: provider.ownerId, // Map ownerId to userId for API consistency
    name: provider.name,
    type: provider.type,
    baseUrl: provider.baseUrl,
    defaultModel: provider.defaultModel,
    isDefault: provider.isDefault,
    createdAt: new Date(provider.createdAt),
    updatedAt: new Date(provider.updatedAt),
  }));
  
  // 5. Validate output
  const result = ListLlmProvidersOutputSchema.parse(apiProviders);
  
  logger.debug("Listed LLM providers", { count: result.length });
  
  return result;
}

declare global {
  namespace WindowAPI {
    interface LlmProvider {
      list: (filters?: ListLlmProvidersInput) => Promise<ListLlmProvidersOutput>
    }
  }
}