import { z } from "zod";
import { findLlmProvider } from "@/main/ipc/llm-provider/queries";
import { LlmProviderSchema } from "@/shared/types";
import { requireAuth } from "@/main/services/session-registry";
import { getLogger } from "@/shared/services/logger/config";
import { createIPCHandler, InferHandler } from "@/shared/utils/create-ipc-handler";

const logger = getLogger("llm-provider.get.invoke");

const GetLlmProviderInputSchema = z.object({
  providerId: z.string().min(1, "Provider ID is required"),
});

const GetLlmProviderOutputSchema = LlmProviderSchema.nullable();

const handler = createIPCHandler({
  inputSchema: GetLlmProviderInputSchema,
  outputSchema: GetLlmProviderOutputSchema,
  handler: async (input) => {
    logger.debug("Getting LLM provider by ID", { providerId: input.providerId });

    const currentUser = requireAuth();

    // Find provider with ownership validation
    const dbProvider = await findLlmProvider(input.providerId, currentUser.id);
    
    // Mapeamento: SelectLlmProvider → LlmProvider (dados puros da entidade)
    const apiProvider = dbProvider ? {
      id: dbProvider.id,
      userId: dbProvider.ownerId, // Map ownerId to userId for API consistency
      name: dbProvider.name,
      type: dbProvider.type,
      baseUrl: dbProvider.baseUrl,
      defaultModel: dbProvider.defaultModel,
      isDefault: dbProvider.isDefault,
      createdAt: new Date(dbProvider.createdAt),
      updatedAt: new Date(dbProvider.updatedAt),
    } : null;
    
    logger.debug("LLM provider found", { found: apiProvider !== null });
    
    return apiProvider;
  }
});

export default handler;

declare global {
  namespace WindowAPI {
    interface LlmProvider {
      get: InferHandler<typeof handler>
    }
  }
}
