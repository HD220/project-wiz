import {
  createDirectMessage,
  getConversationMessages,
  processUserMessage,
} from "../../../domains/users/functions";

export async function handleCreateDirectMessage(_, data) {
  return await createDirectMessage(data);
}

export async function handleListConversationMessages(_, data) {
  const limit = data.limit || 20;
  const offset = data.offset || 0;
  return await getConversationMessages(data.conversationId, limit, offset);
}

export async function handleSendAIMessage(_, data) {
  return await processUserMessage(
    data.conversationId,
    data.content,
    data.userId,
  );
}

export async function handleSendAgentMessage(_, data) {
  return await processUserMessage(
    data.conversationId,
    data.message,
    data.userId,
  );
}
