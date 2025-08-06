import { z } from "zod";
import { inactivateLlmProvider } from "@/main/ipc/llm-provider/queries";
import { requireAuth } from "@/main/services/session-registry";
import { eventBus } from "@/shared/services/events/event-bus";
import { getLogger } from "@/shared/services/logger/config";

const logger = getLogger("llm-provider.inactivate.invoke");

// Input schema - simple ID string
const InactivateLlmProviderInputSchema = z.string().min(1);

// Output schema - resultado da operação
const InactivateLlmProviderOutputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

type InactivateLlmProviderInput = z.infer<typeof InactivateLlmProviderInputSchema>;
type InactivateLlmProviderOutput = z.infer<typeof InactivateLlmProviderOutputSchema>;

export default async function (
  id: InactivateLlmProviderInput,
): Promise<InactivateLlmProviderOutput> {
  logger.debug("Inactivating LLM provider");

  // 1. Validate input
  const validatedId = InactivateLlmProviderInputSchema.parse(id);

  // 2. Check authentication
  const currentUser = requireAuth();

  // 3. Inactivate provider with ownership validation
  const result = await inactivateLlmProvider(validatedId, currentUser.id, currentUser.id);

  const success = !!result;

  // 4. Validate output
  const validatedResult = InactivateLlmProviderOutputSchema.parse({
    success,
    message: success ? "Provider inactivated successfully" : "Failed to inactivate provider",
  });

  // 5. Emit event
  if (success) {
    eventBus.emit("llm-provider:inactivated", { providerId: validatedId });
  }

  logger.debug("LLM provider inactivated", { success: validatedResult.success });

  return validatedResult;
}

declare global {
  namespace WindowAPI {
    interface LlmProvider {
      inactivate: (
        id: InactivateLlmProviderInput,
      ) => Promise<InactivateLlmProviderOutput>;
    }
  }
}
