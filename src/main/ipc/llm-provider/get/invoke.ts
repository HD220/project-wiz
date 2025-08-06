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
    
    // Mapeamento: SelectLlmProvider → LlmProvider
    const apiProvider = dbProvider ? {
      id: dbProvider.id,
      ownerId: dbProvider.ownerId,
      name: dbProvider.name,
      type: dbProvider.type,
      apiKey: dbProvider.apiKey,
      baseUrl: dbProvider.baseUrl,
      defaultModel: dbProvider.defaultModel,
      isDefault: dbProvider.isDefault,
      isActive: dbProvider.isActive,
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
