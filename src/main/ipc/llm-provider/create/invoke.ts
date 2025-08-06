import { z } from "zod";
import { createLlmProvider } from "@/main/ipc/llm-provider/queries";
import { LlmProviderSchema } from "@/shared/types";
import { requireAuth } from "@/main/services/session-registry";
import { getLogger } from "@/shared/services/logger/config";
import { eventBus } from "@/shared/services/events/event-bus";
import { createIPCHandler, InferHandler } from "@/shared/utils/create-ipc-handler";

const logger = getLogger("llm-provider.create.invoke");

const CreateLlmProviderInputSchema = LlmProviderSchema.pick({
  name: true,
  type: true,
  defaultModel: true,
  isDefault: true,
  isActive: true
}).extend({
  apiKey: z.string().min(1, "API key is required"),
  baseUrl: z.string().nullable().optional()
});

const CreateLlmProviderOutputSchema = LlmProviderSchema;

const handler = createIPCHandler({
  inputSchema: CreateLlmProviderInputSchema,
  outputSchema: CreateLlmProviderOutputSchema,
  handler: async (input) => {
    logger.debug("Creating LLM provider", { providerName: input.name, type: input.type });

    const currentUser = requireAuth();
    
    // Create provider with ownership
    const dbProvider = await createLlmProvider({
      ...input,
      ownerId: currentUser.id,
      isDefault: input.isDefault ?? false,
      isActive: input.isActive ?? true
    });
    
    // Mapeamento: SelectLlmProvider → LlmProvider
    const apiProvider = {
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
    };
    
    logger.debug("LLM provider created", { 
      providerId: apiProvider.id, 
      providerName: apiProvider.name,
      type: apiProvider.type
    });
    
    // Emit specific event for creation
    eventBus.emit("llm-provider:created", { providerId: apiProvider.id });
    
    return apiProvider;
  }
});

export default handler;

declare global {
  namespace WindowAPI {
    interface LlmProvider {
      create: InferHandler<typeof handler>
    }
  }
}