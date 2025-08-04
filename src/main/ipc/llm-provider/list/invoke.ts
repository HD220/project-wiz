import { 
  listLlmProviders,
  type ListLlmProvidersInput,
  type ListLlmProvidersOutput 
} from "./queries";
import { requireAuth } from "@/main/utils/session-registry";
import { getLogger } from "@/shared/logger/config";

const logger = getLogger("llm-provider.list.invoke");

// Input type for the invoke handler (without userId that is added automatically)
export type ListLlmProvidersInvokeInput = Omit<ListLlmProvidersInput, "userId">;

export default async function(params: ListLlmProvidersInvokeInput = {}): Promise<ListLlmProvidersOutput> {
  logger.debug("Listing LLM providers for user", { filters: params });

  // 1. Check authentication
  const currentUser = requireAuth();
  
  // 2. Add userId from current user
  const filters = {
    ...params,
    userId: currentUser.id
  };
  
  // 3. Execute core business logic
  const result = await listLlmProviders(filters);
  
  logger.debug("Listed LLM providers", { count: result.length, userId: currentUser.id });
  
  // Note: No event emission for queries/list operations
  
  return result;
}

declare global {
  namespace WindowAPI {
    interface LlmProvider {
      list: (filters?: ListLlmProvidersInvokeInput) => Promise<ListLlmProvidersOutput>
    }
  }
}