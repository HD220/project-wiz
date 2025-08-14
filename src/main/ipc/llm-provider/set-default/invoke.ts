import { z } from "zod";

import { setDefaultLlmProvider } from "@/main/ipc/llm-provider/queries";
import { requireAuth } from "@/main/services/session-registry";

import { emit } from "@/shared/services/events/event-bus";
import { getLogger } from "@/shared/services/logger/config";
import {
  createIPCHandler,
  InferHandler,
} from "@/shared/utils/create-ipc-handler";

const logger = getLogger("llm-provider.set-default.invoke");

const SetDefaultProviderInputSchema = z.object({
  providerId: z.string().min(1, "Provider ID is required"),
});

const SetDefaultProviderOutputSchema = z.void();

const handler = createIPCHandler({
  inputSchema: SetDefaultProviderInputSchema,
  outputSchema: SetDefaultProviderOutputSchema,
  handler: async (input) => {
    logger.debug("Setting default LLM provider", {
      providerId: input.providerId,
    });

    const currentUser = requireAuth();

    // Set default provider with ownership validation
    await setDefaultLlmProvider(input.providerId, currentUser.id);

    logger.debug("Default LLM provider set", {
      providerId: input.providerId,
      userId: currentUser.id,
    });

    // Emit specific event
    emit("llm-provider:default-changed", {
      providerId: input.providerId,
    });

    return undefined;
  },
});

export default handler;

declare global {
  namespace WindowAPI {
    interface LlmProvider {
      setDefault: InferHandler<typeof handler>;
    }
  }
}
