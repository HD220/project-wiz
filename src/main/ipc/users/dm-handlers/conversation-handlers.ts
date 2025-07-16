import {
  createConversation,
  findConversationById,
  findAllConversations,
  findOrCreateDirectMessage,
} from "../../../domains/users/functions";

export async function handleCreateConversation(_, data) {
  return await createConversation(data);
}

export async function handleGetConversationById(_, data) {
  return await findConversationById(data.id);
}

export async function handleListConversations() {
  return await findAllConversations();
}

export async function handleFindOrCreateConversation(_, data) {
  return await findOrCreateDirectMessage(data.participants);
}
