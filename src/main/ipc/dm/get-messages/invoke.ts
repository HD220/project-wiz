import { z } from "zod";
import { 
  getDMMessages,
  type GetDMMessagesInput,
  type GetDMMessagesOutput 
} from "./queries";
import { requireAuth } from "@/main/utils/session-registry";
import { getLogger } from "@/shared/logger/config";

const logger = getLogger("dm.get-messages.invoke");

export default async function(input: GetDMMessagesInput): Promise<GetDMMessagesOutput> {
  logger.debug("Getting DM messages", { dmId: input.dmId });

  // 1. Check authentication
  const currentUser = requireAuth();
  
  // 2. Execute core business logic (no event emission for queries)
  const result = await getDMMessages(input);
  
  logger.debug("Retrieved DM messages", { count: result.length, dmId: input.dmId });
  
  return result;
}

declare global {
  namespace WindowAPI {
    interface Dm {
      getMessages: (input: GetDMMessagesInput) => Promise<GetDMMessagesOutput>
    }
  }
}
EOF < /dev/null
