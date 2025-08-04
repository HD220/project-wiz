import { z } from "zod";
import { 
  getChannelMessages,
  type GetChannelMessagesInput,
  type GetChannelMessagesOutput 
} from "./queries";
import { requireAuth } from "@/main/utils/session-registry";
import { getLogger } from "@/shared/logger/config";

const logger = getLogger("channel.get-messages.invoke");

export default async function(input: GetChannelMessagesInput): Promise<GetChannelMessagesOutput> {
  logger.debug("Getting channel messages", { channelId: input.channelId });

  // 1. Check authentication
  const currentUser = requireAuth();
  
  // 2. Execute core business logic
  const result = await getChannelMessages(input);
  
  logger.debug("Channel messages retrieved", { 
    channelId: input.channelId, 
    messageCount: result.length 
  });
  
  // Note: No event emission for GET operations
  
  return result;
}

declare global {
  namespace WindowAPI {
    interface Channel {
      getMessages: (input: GetChannelMessagesInput) => Promise<GetChannelMessagesOutput>
    }
  }
}