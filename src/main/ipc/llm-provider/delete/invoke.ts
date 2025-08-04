import { z } from "zod";

import { requireAuth } from "@/main/utils/session-registry";

import { eventBus } from "@/shared/events/event-bus";
import { getLogger } from "@/shared/logger/config";

import { deleteLlmProvider } from "./queries";

const logger = getLogger("llm-provider.delete.invoke");

// Input schema - apenas ID do provider
const DeleteLlmProviderInputSchema = z.object({
  id: z.string(),
});

// Output schema - resultado da operação
const DeleteLlmProviderOutputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

type DeleteLlmProviderInput = z.infer<typeof DeleteLlmProviderInputSchema>;
type DeleteLlmProviderOutput = z.infer<typeof DeleteLlmProviderOutputSchema>;

export default async function (
  input: DeleteLlmProviderInput,
): Promise<DeleteLlmProviderOutput> {
  logger.debug("Deleting LLM provider");

  // 1. Validate input
  const validatedInput = DeleteLlmProviderInputSchema.parse(input);

  // 2. Check authentication
  const currentUser = requireAuth();

  // 3. Query recebe dados e gerencia campos técnicos internamente
  const success = await deleteLlmProvider(validatedInput.id, currentUser.id);

  // 4. Validate output
  const result = DeleteLlmProviderOutputSchema.parse({
    success,
    message: "Provider deleted successfully",
  });

  // 5. Emit event
  eventBus.emit("llm-provider:deleted", { providerId: validatedInput.id });

  logger.debug("LLM provider deleted", { success: result.success });

  return result;
}

declare global {
  namespace WindowAPI {
    interface LlmProvider {
      delete: (
        input: DeleteLlmProviderInput,
      ) => Promise<DeleteLlmProviderOutput>;
    }
  }
}
