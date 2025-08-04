import { z } from "zod";
import { setDefaultProvider } from "./queries";
import { requireAuth } from "@/main/utils/session-registry";
import { getLogger } from "@/shared/logger/config";
import { eventBus } from "@/shared/events/event-bus";

const logger = getLogger("llm-provider.set-default.invoke");

// Input schema (without userId that is added automatically)
const SetDefaultProviderInputSchema = z.object({
  providerId: z.string().min(1, "Provider ID is required"),
});

// Output schema
const SetDefaultProviderOutputSchema = z.object({
  message: z.string(),
});

type SetDefaultProviderInput = z.infer<typeof SetDefaultProviderInputSchema>;
type SetDefaultProviderOutput = z.infer<typeof SetDefaultProviderOutputSchema>;

export default async function(input: SetDefaultProviderInput): Promise<SetDefaultProviderOutput> {
  logger.debug("Setting default LLM provider", { providerId: input.providerId });

  // 1. Validate input
  const validatedInput = SetDefaultProviderInputSchema.parse(input);

  // 2. Check authentication
  const currentUser = requireAuth();
  
  // 3. Execute query
  const dbResult = await setDefaultProvider({
    ...validatedInput,
    userId: currentUser.id
  });
  
  // 4. Validate output
  const result = SetDefaultProviderOutputSchema.parse(dbResult);
  
  logger.debug("Default LLM provider set", { providerId: input.providerId, userId: currentUser.id });
  
  // 5. Emit specific event
  eventBus.emit("llm-provider:default-changed", { providerId: input.providerId });
  
  return result;
}

declare global {
  namespace WindowAPI {
    interface LlmProvider {
      setDefault: (input: SetDefaultProviderInput) => Promise<SetDefaultProviderOutput>
    }
  }
}
