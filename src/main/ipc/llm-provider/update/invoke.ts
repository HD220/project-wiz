import { z } from "zod";
import { updateLlmProvider } from "@/main/ipc/llm-provider/queries";
import { LlmProviderSchema } from "@/shared/types";
import { requireAuth } from "@/main/services/session-registry";
import { getLogger } from "@/shared/services/logger/config";
import { eventBus } from "@/shared/services/events/event-bus";

const logger = getLogger("llm-provider.update.invoke");

// Input schema - usando LlmProviderSchema com campos específicos + id obrigatório
const UpdateLlmProviderInputSchema = LlmProviderSchema.pick({ 
  name: true, 
  type: true, 
  baseUrl: true 
}).partial().extend({ 
  id: z.string(),
  apiKey: z.string().optional()
});

const UpdateLlmProviderOutputSchema = LlmProviderSchema;

type UpdateLlmProviderInput = z.infer<typeof UpdateLlmProviderInputSchema>;
type UpdateLlmProviderOutput = z.infer<typeof UpdateLlmProviderOutputSchema>;

export default async function(input: UpdateLlmProviderInput): Promise<UpdateLlmProviderOutput> {
  logger.debug("Updating LLM provider", { providerId: input.id });

  // 1. Validate input
  const validatedInput = UpdateLlmProviderInputSchema.parse(input);
  
  // 2. Check authentication
  const currentUser = requireAuth();
  
  const { id, ...data } = validatedInput;

  // 3. Update provider with ownership validation
  const result = await updateLlmProvider({
    id,
    ownerId: currentUser.id,
    ...data
  });
  
  if (!result) {
    throw new Error(`Failed to update LLM provider or access denied: ${input.id}`);
  }

  // 4. Map database result to shared type
  const mapped = {
    id: result.id,
    userId: result.ownerId, // Map ownerId to userId for API consistency
    name: result.name,
    type: result.type,
    baseUrl: result.baseUrl,
    defaultModel: result.defaultModel,
    isDefault: result.isDefault,
    createdAt: new Date(result.createdAt),
    updatedAt: new Date(result.updatedAt),
  };

  // 5. Validate output
  const validatedResult = UpdateLlmProviderOutputSchema.parse(mapped);

  // Emit event after validation
  eventBus.emit("llm-provider:updated", { providerId: validatedResult.id });
  
  logger.debug("LLM provider updated", { providerId: validatedResult.id, providerName: validatedResult.name });

  return validatedResult;
}

declare global {
  namespace WindowAPI {
    interface LlmProvider {
      update: (input: UpdateLlmProviderInput) => Promise<UpdateLlmProviderOutput>
    }
  }
}
