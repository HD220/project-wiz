import { z } from "zod";
import { createLlmProvider } from "./queries";
import { LlmProviderSchema } from "@/shared/types";
import { requireAuth } from "@/main/services/session-registry";
import { getLogger } from "@/shared/logger/config";
import { eventBus } from "@/shared/events/event-bus";

const logger = getLogger("llm-provider.create.invoke");

const CreateLlmProviderInputSchema = LlmProviderSchema.pick({
  name: true,
  type: true,
  baseUrl: true,
  defaultModel: true
}).extend({
  apiKey: z.string().min(1, "API key is required")
});

const CreateLlmProviderOutputSchema = LlmProviderSchema;

type CreateLlmProviderInput = z.infer<typeof CreateLlmProviderInputSchema>;
type CreateLlmProviderOutput = z.infer<typeof CreateLlmProviderOutputSchema>;

export default async function(input: CreateLlmProviderInput): Promise<CreateLlmProviderOutput> {
  logger.debug("Creating LLM provider", { providerName: input.name, type: input.type });

  // 1. Validate input
  const validatedInput = CreateLlmProviderInputSchema.parse(input);

  // 2. Check authentication
  const currentUser = requireAuth();
  
  // 3. Query recebe dados e gerencia campos técnicos internamente
  const dbProvider = await createLlmProvider({
    ...validatedInput,
    userId: currentUser.id,
    isDefault: false,
    isActive: true
  });
  
  // 4. Mapeamento: SelectLlmProvider → LlmProvider (sem campos técnicos)
  const apiProvider = {
    id: dbProvider.id,
    userId: dbProvider.userId,
    name: dbProvider.name,
    type: dbProvider.type,
    baseUrl: dbProvider.baseUrl,
    defaultModel: dbProvider.defaultModel,
    isDefault: dbProvider.isDefault,
    createdAt: new Date(dbProvider.createdAt),
    updatedAt: new Date(dbProvider.updatedAt),
  };
  
  // 5. Validate output
  const result = CreateLlmProviderOutputSchema.parse(apiProvider);
  
  logger.debug("LLM provider created", { 
    providerId: result.id, 
    providerName: result.name,
    type: result.type
  });
  
  // 6. Emit specific event for creation
  eventBus.emit("llm-provider:created", { providerId: result.id });
  
  return result;
}

declare global {
  namespace WindowAPI {
    interface LlmProvider {
      create: (input: CreateLlmProviderInput) => Promise<CreateLlmProviderOutput>
    }
  }
}