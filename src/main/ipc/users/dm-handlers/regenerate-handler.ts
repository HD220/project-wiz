import {
  getConversationMessages,
  processUserMessage,
} from "../../../domains/users/functions";

export async function handleRegenerateResponse(_, data) {
  const messages = await getConversationMessages(data.conversationId, 10, 0);
  const lastUserMessage = messages
    .filter((msg) => msg.senderType === "user")
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
