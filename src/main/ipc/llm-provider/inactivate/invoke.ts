import { z } from "zod";
import { inactivateLlmProvider } from "@/main/ipc/llm-provider/queries";
import { requireAuth } from "@/main/services/session-registry";
import { eventBus } from "@/shared/services/events/event-bus";
import { getLogger } from "@/shared/services/logger/config";
import { createIPCHandler, InferHandler } from "@/shared/utils/create-ipc-handler";

const logger = getLogger("llm-provider.inactivate.invoke");

const InactivateLlmProviderInputSchema = z.object({
  id: z.string().min(1, "Provider ID is required"),
});

const InactivateLlmProviderOutputSchema = z.void();

const handler = createIPCHandler({
  inputSchema: InactivateLlmProviderInputSchema,
  outputSchema: InactivateLlmProviderOutputSchema,
  handler: async (input) => {
    logger.debug("Inactivating LLM provider", { providerId: input.id });

    const currentUser = requireAuth();

    // Inactivate provider with ownership validation
    const result = await inactivateLlmProvider(input.id, currentUser.id);

    if (!result) {
      throw new Error("Failed to inactivate provider or provider not found");
    }

    logger.debug("LLM provider inactivated", { providerId: input.id });

    // Emit event
    eventBus.emit("llm-provider:inactivated", { providerId: input.id });

    return undefined;
  }
});

export default handler;

declare global {
  namespace WindowAPI {
    interface LlmProvider {
      inactivate: InferHandler<typeof handler>
    }
  }
}
