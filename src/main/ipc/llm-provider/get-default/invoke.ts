import { 
  getDefaultProvider,
  type GetDefaultProviderInput,
  type GetDefaultProviderOutput 
} from "./queries";
import { requireAuth } from "@/main/utils/session-registry";
import { getLogger } from "@/shared/logger/config";

const logger = getLogger("llm-provider.get-default.invoke");

export default async function(): Promise<GetDefaultProviderOutput> {
  logger.debug("Getting default LLM provider for user");

  // 1. Check authentication
  const currentUser = requireAuth();
  
  // 2. Execute core business logic
  const result = await getDefaultProvider({ userId: currentUser.id });
  
  logger.debug("Default LLM provider retrieved", { found: !!result, userId: currentUser.id });
  
  // Note: No event emission for queries/get operations
  
  return result;
}

declare global {
  namespace WindowAPI {
    interface LlmProvider {
      getDefault: () => Promise<GetDefaultProviderOutput>
    }
  }
}
EOF < /dev/null
