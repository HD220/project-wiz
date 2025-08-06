import { z } from "zod";
import { inactivateLlmProvider } from "@/main/ipc/llm-provider/queries";
import { requireAuth } from "@/main/services/session-registry";
import { eventBus } from "@/shared/services/events/event-bus";
import { getLogger } from "@/shared/services/logger/config";

const logger = getLogger("llm-provider.inactivate.invoke");

// Input schema - object wrapper para consistência
const InactivateLlmProviderInputSchema = z.object({
  id: z.string().min(1, "Provider ID is required"),
});

// Output schema - void para operações de inativação
const InactivateLlmProviderOutputSchema = z.void();

type InactivateLlmProviderInput = z.infer<typeof InactivateLlmProviderInputSchema>;
type InactivateLlmProviderOutput = z.infer<typeof InactivateLlmProviderOutputSchema>;

export default async function (
  input: InactivateLlmProviderInput,
): Promise<InactivateLlmProviderOutput> {
  logger.debug("Inactivating LLM provider", { providerId: input.id });

  // 1. Validate input
  const validatedInput = InactivateLlmProviderInputSchema.parse(input);

  // 2. Check authentication
  const currentUser = requireAuth();

  // 3. Inactivate provider with ownership validation
  const result = await inactivateLlmProvider(validatedInput.id, currentUser.id, currentUser.id);

  if (!result) {
    throw new Error("Failed to inactivate provider or provider not found");
  }

  logger.debug("LLM provider inactivated", { providerId: validatedInput.id });

  // 4. Emit event
  eventBus.emit("llm-provider:inactivated", { providerId: validatedInput.id });

  return undefined;
}

declare global {
  namespace WindowAPI {
    interface LlmProvider {
      inactivate: (
        input: InactivateLlmProviderInput,
      ) => Promise<InactivateLlmProviderOutput>;
    }
  }
}
