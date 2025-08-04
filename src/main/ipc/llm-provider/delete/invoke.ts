import { 
  deleteLlmProvider,
  type DeleteLlmProviderInput,
  type DeleteLlmProviderOutput 
} from "./queries";
import { getLogger } from "@/shared/logger/config";
import { eventBus } from "@/shared/events/event-bus";

const logger = getLogger("llm-provider.delete.invoke");

export default async function(id: DeleteLlmProviderInput): Promise<DeleteLlmProviderOutput> {
  logger.debug("Deleting LLM provider", { providerId: id });

  // Execute core business logic
  const result = await deleteLlmProvider(id);
  
  logger.debug("LLM provider deleted", { providerId: id });
  
  // Emit specific event
  eventBus.emit("llm-provider:deleted", { providerId: id });
  
  return result;
}

declare global {
  namespace WindowAPI {
    interface LlmProvider {
      delete: (id: DeleteLlmProviderInput) => Promise<DeleteLlmProviderOutput>
    }
  }
}
EOF < /dev/null
