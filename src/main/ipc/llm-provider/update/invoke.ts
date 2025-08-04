import { z } from "zod";
import { updateLlmProvider } from "./queries";
import { LlmProviderSchema } from "@/shared/types";
import { getLogger } from "@/shared/logger/config";
import { eventBus } from "@/shared/events/event-bus";

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

  // Validar input
  const validatedInput = UpdateLlmProviderInputSchema.parse(input);
  
  const { id, ...data } = validatedInput;

  // Execute core business logic
  const result = await updateLlmProvider(id, data);
  
  if (!result) {
    throw new Error(`Failed to update LLM provider: ${input.id}`);
  }

  // Mapear resultado removendo campos técnicos e convertendo timestamps
  const mapped = {
    id: result.id,
    userId: result.userId,
    name: result.name,
    type: result.type,
    baseUrl: result.baseUrl,
    defaultModel: result.defaultModel,
    isDefault: result.isDefault,
    createdAt: new Date(result.createdAt),
    updatedAt: new Date(result.updatedAt),
  };

  // Validar output
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
