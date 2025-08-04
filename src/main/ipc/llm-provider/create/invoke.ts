import { 
  createLlmProvider,
  type CreateLlmProviderInput,
  type CreateLlmProviderOutput 
} from "./queries";
import { requireAuth } from "@/main/utils/session-registry";
import { getLogger } from "@/shared/logger/config";
import { eventBus } from "@/shared/events/event-bus";

const logger = getLogger("llm-provider.create.invoke");

// Input type for the invoke handler (without userId that is added automatically)
export type CreateLlmProviderInvokeInput = Omit<CreateLlmProviderInput, "userId">;

export default async function(params: CreateLlmProviderInvokeInput): Promise<CreateLlmProviderOutput> {
  logger.debug("Creating LLM provider", { providerName: params.name, type: params.type });

  // 1. Check authentication
  const currentUser = requireAuth();
  
  // 2. Add userId from current user
  const providerData = {
    ...params,
    userId: currentUser.id
  };
  
  // 3. Execute core business logic
  const result = await createLlmProvider(providerData);
  
  logger.debug("LLM provider created", { providerId: result.id, providerName: result.name });
  
  // 4. Emit specific event
  eventBus.emit("llm-provider:created", { providerId: result.id });
  
  return result;
}

declare global {
  namespace WindowAPI {
    interface LlmProvider {
      create: (params: CreateLlmProviderInvokeInput) => Promise<CreateLlmProviderOutput>
    }
  }
}