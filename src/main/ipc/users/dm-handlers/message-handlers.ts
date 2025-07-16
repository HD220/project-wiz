import {
  findOrCreateDirectMessage,
  getConversationMessages,
  processUserMessage,
} from "../../../domains/users/functions";

export async function handleCreateDirectMessage(_: any, data: any) {
  return await findOrCreateDirectMessage(data.participants);
}

export async function handleListConversationMessages(_: any, data: any) {
  const limit = data.limit || 20;
  const offset = data.offset || 0;
  return await getConversationMessages(data.conversationId, limit, offset);
}

export async function handleSendAIMessage(_: any, data: any) {
  return await processUserMessage(
    data.conversationId,
    data.content,
    data.userId,
  );
}

export async function handleSendAgentMessage(_: any, data: any) {
  return await processUserMessage(
    data.conversationId,
    data.message,
    data.userId,
  );
}
