import {
  getConversationMessages,
  processUserMessage,
} from "../../../domains/users/functions/conversation-operations.functions";

import type { DirectMessageDto } from "../../../../shared/types";

export async function handleRegenerateResponse(
  _: unknown,
  data: { conversationId: string; userId: string },
) {
  const messages = await getConversationMessages(data.conversationId, 10, 0);
  const lastUserMessage = messages
    .filter((msg: DirectMessageDto) => msg.senderType === "user")
    .pop();

  if (!lastUserMessage) {
    return null;
  }

  return await processUserMessage(
    data.conversationId,
    lastUserMessage.content,
    data.userId,
  );
}
