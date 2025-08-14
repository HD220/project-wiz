import { z } from "zod";

import { updateLlmProvider } from "@/main/ipc/llm-provider/queries";
import { requireAuth } from "@/main/services/session-registry";

import { emit } from "@/shared/services/events/event-bus";
import { getLogger } from "@/shared/services/logger/config";
import { LlmProviderSchema } from "@/shared/types";
import {
  createIPCHandler,
  InferHandler,
} from "@/shared/utils/create-ipc-handler";

const logger = getLogger("llm-provider.update.invoke");

const UpdateLlmProviderInputSchema = z.object({
  id: z.string().min(1, "Provider ID is required"),
  data: LlmProviderSchema.pick({
    name: true,
    type: true,
    baseUrl: true,
    defaultModel: true,
    isDefault: true,
    deactivatedAt: true,
  })
    .partial()
    .extend({
      apiKey: z.string().optional(),
    }),
});

const UpdateLlmProviderOutputSchema = LlmProviderSchema;

const handler = createIPCHandler({
  inputSchema: UpdateLlmProviderInputSchema,
  outputSchema: UpdateLlmProviderOutputSchema,
  handler: async (input) => {
    logger.debug("Updating LLM provider", { providerId: input.id });

    const currentUser = requireAuth();

    const { id, data } = input;

    // Update provider with ownership validation
    const result = await updateLlmProvider({
      id,
      ownerId: currentUser.id,
      ...data,
    });

    if (!result) {
      throw new Error(
        `Failed to update LLM provider or access denied: ${input.id}`,
      );
    }

    // Mapeamento: SelectLlmProvider → LlmProvider
    const apiProvider = {
      id: result.id,
      ownerId: result.ownerId,
      name: result.name,
      type: result.type,
      apiKey: result.apiKey,
      baseUrl: result.baseUrl,
      defaultModel: result.defaultModel,
      isDefault: result.isDefault,
      deactivatedAt: result.deactivatedAt
        ? new Date(result.deactivatedAt)
        : null,
      createdAt: new Date(result.createdAt),
      updatedAt: new Date(result.updatedAt),
    };

    logger.debug("LLM provider updated", {
      providerId: apiProvider.id,
      providerName: apiProvider.name,
    });

    // Emit event after validation
    emit("llm-provider:updated", { providerId: apiProvider.id });

    return apiProvider;
  },
});

export default handler;

declare global {
  namespace WindowAPI {
    interface LlmProvider {
      update: InferHandler<typeof handler>;
    }
  }
}
