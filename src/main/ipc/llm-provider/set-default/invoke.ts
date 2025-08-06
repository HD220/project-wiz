import { z } from "zod";
import { setDefaultLlmProvider } from "@/main/ipc/llm-provider/queries";
import { requireAuth } from "@/main/services/session-registry";
import { getLogger } from "@/shared/services/logger/config";
import { eventBus } from "@/shared/services/events/event-bus";

const logger = getLogger("llm-provider.set-default.invoke");

// Input schema (without userId that is added automatically)
const SetDefaultProviderInputSchema = z.object({
  providerId: z.string().min(1, "Provider ID is required"),
});

// Output schema - void para operações de configuração
const SetDefaultProviderOutputSchema = z.void();

type SetDefaultProviderInput = z.infer<typeof SetDefaultProviderInputSchema>;
type SetDefaultProviderOutput = z.infer<typeof SetDefaultProviderOutputSchema>;

export default async function(input: SetDefaultProviderInput): Promise<SetDefaultProviderOutput> {
  logger.debug("Setting default LLM provider", { providerId: input.providerId });

  // 1. Validate input
  const validatedInput = SetDefaultProviderInputSchema.parse(input);

  // 2. Check authentication
  const currentUser = requireAuth();
  
  // 3. Set default provider with ownership validation
  await setDefaultLlmProvider(validatedInput.providerId, currentUser.id);
  
  logger.debug("Default LLM provider set", { providerId: input.providerId, userId: currentUser.id });
  
  // 4. Emit specific event
  eventBus.emit("llm-provider:default-changed", { providerId: input.providerId });
  
  return undefined;
}

declare global {
  namespace WindowAPI {
    interface LlmProvider {
      setDefault: (input: SetDefaultProviderInput) => Promise<SetDefaultProviderOutput>
    }
  }
}
