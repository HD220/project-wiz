import { 
  updateLlmProvider,
  type UpdateLlmProviderInput,
  type UpdateLlmProviderOutput 
} from "./queries";
import { getLogger } from "@/shared/logger/config";
import { eventBus } from "@/shared/events/event-bus";

const logger = getLogger("llm-provider.update.invoke");

export default async function(input: UpdateLlmProviderInput): Promise<UpdateLlmProviderOutput> {
  logger.debug("Updating LLM provider", { providerId: input.id });

  // Execute core business logic
  const result = await updateLlmProvider(input);
  
  logger.debug("LLM provider updated", { providerId: result.id, providerName: result.name });
  
  // Emit specific event
  eventBus.emit("llm-provider:updated", { providerId: result.id });
  
  return result;
}

declare global {
  namespace WindowAPI {
    interface LlmProvider {
      update: (input: UpdateLlmProviderInput) => Promise<UpdateLlmProviderOutput>
    }
  }
}
EOF < /dev/null
