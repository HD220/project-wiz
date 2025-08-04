import { 
  setDefaultProvider,
  type SetDefaultProviderInput,
  type SetDefaultProviderOutput 
} from "./queries";
import { requireAuth } from "@/main/utils/session-registry";
import { getLogger } from "@/shared/logger/config";
import { eventBus } from "@/shared/events/event-bus";

const logger = getLogger("llm-provider.set-default.invoke");

// Input type for the invoke handler (without userId that is added automatically)
export type SetDefaultProviderInvokeInput = Omit<SetDefaultProviderInput, "userId">;

export default async function(input: SetDefaultProviderInvokeInput): Promise<SetDefaultProviderOutput> {
  logger.debug("Setting default LLM provider", { providerId: input.providerId });

  // 1. Check authentication
  const currentUser = requireAuth();
  
  // 2. Add userId from current user
  const defaultData = {
    ...input,
    userId: currentUser.id
  };
  
  // 3. Execute core business logic
  const result = await setDefaultProvider(defaultData);
  
  logger.debug("Default LLM provider set", { providerId: input.providerId, userId: currentUser.id });
  
  // 4. Emit specific event
  eventBus.emit("llm-provider:default-changed", { providerId: input.providerId });
  
  return result;
}

declare global {
  namespace WindowAPI {
    interface LlmProvider {
      setDefault: (input: SetDefaultProviderInvokeInput) => Promise<SetDefaultProviderOutput>
    }
  }
}
EOF < /dev/null
