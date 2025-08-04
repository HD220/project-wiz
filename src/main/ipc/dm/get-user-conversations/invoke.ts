import { z } from "zod";
import { getUserConversations } from "./queries";
import {
  GetUserConversationsInputSchema,
  GetUserConversationsOutputSchema,
  type GetUserConversationsInput,
  type GetUserConversationsOutput 
} from "@/shared/types/dm-conversation";
import { requireAuth } from "@/main/utils/session-registry";
import { getLogger } from "@/shared/logger/config";

const logger = getLogger("dm.get-user-conversations.invoke");

// Input type para o invoke (sem userId que é adicionado automaticamente)
export type GetUserConversationsInvokeInput = Omit<GetUserConversationsInput, "userId">;

export default async function(filters: GetUserConversationsInvokeInput = {}): Promise<GetUserConversationsOutput> {
  logger.debug("Getting user DM conversations", { filters });

  // 1. Parse and validate input (optional fields)
  const parsedFilters = z.object({
    includeInactive: z.boolean().optional().default(false),
    includeArchived: z.boolean().optional().default(false),
    limit: z.number().optional(),
    offset: z.number().optional(),
  }).parse(filters);

  // 2. Check authentication
  const currentUser = requireAuth();
  
  // 3. Add userId from current user
  const queryFilters: GetUserConversationsInput = {
    ...parsedFilters,
    userId: currentUser.id
  };
  
  // 4. Execute core business logic (no event emission for queries)
  const result = await getUserConversations(queryFilters);
  
  logger.debug("Retrieved user DM conversations", { count: result.length, userId: currentUser.id });
  
  // 5. Parse and return output
  return GetUserConversationsOutputSchema.parse(result);
}

declare global {
  namespace WindowAPI {
    interface Dm {
      getUserConversations: (filters?: GetUserConversationsInvokeInput) => Promise<GetUserConversationsOutput>
    }
  }
}
