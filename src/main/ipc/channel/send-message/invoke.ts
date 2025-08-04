import { z } from "zod";
import { 
  sendChannelMessage,
  type SendChannelMessageInput,
  type SendChannelMessageOutput 
} from "./queries";
import { requireAuth } from "@/main/utils/session-registry";
import { getLogger } from "@/shared/logger/config";
import { eventBus } from "@/shared/events/event-bus";

const logger = getLogger("channel.send-message.invoke");

// Input type para o invoke (sem authorId que é adicionado automaticamente)
export type SendChannelMessageInvokeInput = Omit<SendChannelMessageInput, "authorId">;

export default async function(input: SendChannelMessageInvokeInput): Promise<SendChannelMessageOutput> {
  logger.debug("Sending message to channel", { channelId: input.channelId });

  // 1. Check authentication
  const currentUser = requireAuth();
  
  // 2. Add authorId from current user
  const messageData = {
    ...input,
    authorId: currentUser.id
  };
  
  // 3. Execute core business logic
  const result = await sendChannelMessage(messageData);
  
  // 4. Emit specific event for channel message sent
  eventBus.emit("channel:message-sent", { 
    channelId: input.channelId, 
    messageId: result.id 
  });
  
  logger.debug("Message sent to channel", { 
    channelId: input.channelId, 
    messageId: result.id 
  });
  
  return result;
}

declare global {
  namespace WindowAPI {
    interface Channel {
      sendMessage: (input: SendChannelMessageInvokeInput) => Promise<SendChannelMessageOutput>
    }
  }
}