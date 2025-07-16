import {
  createProjectMessage,
  findMessageById,
  findMessagesByChannel,
  findMessagesByAuthor,
  deleteMessage,
} from "../../../domains/projects/functions";

export async function handleCreateMessage(_, data) {
  return await createProjectMessage(data);
}

export async function handleGetMessageById(_, data) {
  return await findMessageById(data.id);
}

export async function handleListMessagesByChannel(_, data) {
  return await findMessagesByChannel(data.channelId, data.limit);
}

export async function handleListMessagesByAuthor(_, data) {
  return await findMessagesByAuthor(data.authorId, data.channelId);
}

export async function handleDeleteMessage(_, data) {
  await deleteMessage(data.id, data.userId);
}
