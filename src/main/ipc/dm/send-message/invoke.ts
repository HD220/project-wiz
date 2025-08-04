import { z } from "zod";
import { 
  sendDMMessage,
  type SendDMMessageInput,
  type SendDMMessageOutput 
} from "./queries";
import { requireAuth } from "@/main/utils/session-registry";
import { getLogger } from "@/shared/logger/config";
import { eventBus } from "@/shared/events/event-bus";

const logger = getLogger("dm.send-message.invoke");

// Input type para o invoke (sem authorId que é adicionado automaticamente)
export type SendDMMessageInvokeInput = Omit<SendDMMessageInput, "authorId">;

export default async function(input: SendDMMessageInvokeInput): Promise<SendDMMessageOutput> {
  logger.debug("Sending message to DM", { dmId: input.dmId, contentLength: input.content.length });

  // 1. Check authentication
  const currentUser = requireAuth();
  
  // 2. Add authorId from current user
  const messageData = {
    ...input,
    authorId: currentUser.id
  };
  
  // 3. Execute core business logic
  const result = await sendDMMessage(messageData);
  
  // 4. Emit specific event for this operation
  eventBus.emit("dm:message-sent", { messageId: result.id, dmId: input.dmId });
  
  logger.debug("Message sent to DM", { messageId: result.id, dmId: input.dmId });
  
  return result;
}

declare global {
  namespace WindowAPI {
    interface Dm {
      sendMessage: (input: SendDMMessageInvokeInput) => Promise<SendDMMessageOutput>
    }
  }
}
EOF < /dev/null
