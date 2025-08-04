import { 
  getActiveAgentsForConversation,
  type GetActiveForConversationInput,
  type GetActiveForConversationOutput 
} from "./queries";
import { getLogger } from "@/shared/logger/config";

const logger = getLogger("agent.get-active-for-conversation.invoke");

export default async function(conversationId: GetActiveForConversationInput): Promise<GetActiveForConversationOutput> {
  logger.debug("Getting active agents for conversation", { conversationId });

  // Execute core business logic
  const result = await getActiveAgentsForConversation(conversationId);
  
  logger.debug("Got active agents for conversation", { count: result.length, conversationId });
  
  return result;
}

declare global {
  namespace WindowAPI {
    interface Agent {
      getActiveForConversation: (conversationId: GetActiveForConversationInput) => Promise<GetActiveForConversationOutput>
    }
  }
}