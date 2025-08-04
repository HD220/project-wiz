import { z } from "zod";
import { 
  getUserConversations,
  type GetUserConversationsInput,
  type GetUserConversationsOutput 
} from "./queries";
import { requireAuth } from "@/main/utils/session-registry";
import { getLogger } from "@/shared/logger/config";

const logger = getLogger("dm.get-user-conversations.invoke");

// Input type para o invoke (sem userId que é adicionado automaticamente)
export type GetUserConversationsInvokeInput = Omit<GetUserConversationsInput, "userId">;

export default async function(filters: GetUserConversationsInvokeInput = {}): Promise<GetUserConversationsOutput> {
  logger.debug("Getting user DM conversations", { filters });

  // 1. Check authentication
  const currentUser = requireAuth();
  
  // 2. Add userId from current user
  const queryFilters = {
    ...filters,
    userId: currentUser.id
  };
  
  // 3. Execute core business logic (no event emission for queries)
  const result = await getUserConversations(queryFilters);
  
  logger.debug("Retrieved user DM conversations", { count: result.length, userId: currentUser.id });
  
  return result;
}

declare global {
  namespace WindowAPI {
    interface Dm {
      getUserConversations: (filters?: GetUserConversationsInvokeInput) => Promise<GetUserConversationsOutput>
    }
  }
}
