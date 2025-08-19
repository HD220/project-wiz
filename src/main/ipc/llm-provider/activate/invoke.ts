import { z } from "zod";

import { activateProvider } from "@/main/ipc/llm-provider/queries";
import { requireAuth } from "@/main/services/session-registry";

import { emit } from "@/shared/services/events/event-bus";
import { getLogger } from "@/shared/services/logger/config";
import { LlmProviderSchema } from "@/shared/types";
import {
  createIPCHandler,
  InferHandler,
} from "@/shared/utils/create-ipc-handler";

const logger = getLogger("llm-provider.activate.invoke");

const ActivateProviderInputSchema = z.object({
  id: z.string().min(1, "Provider ID is required"),
});

const ActivateProviderOutputSchema = LlmProviderSchema;

const handler = createIPCHandler({
  inputSchema: ActivateProviderInputSchema,
  outputSchema: ActivateProviderOutputSchema,
  handler: async (input) => {
    logger.debug("Activating provider", {
      providerId: input.id,
    });

    const currentUser = requireAuth();

    // Activate the provider
    const provider = await activateProvider(input.id, currentUser.id);

    logger.debug("Provider activated", {
      providerId: provider.id,
      name: provider.name,
    });

    // Emit reactive event
    emit("event:providers", {
      action: "activated",
      key: provider.id,
      providerId: provider.id,
      userId: currentUser.id,
    });

    return provider;
  },
});

export default handler;

declare global {
  namespace WindowAPI {
    interface LlmProvider {
      activate: InferHandler<typeof handler>;
    }
  }
}