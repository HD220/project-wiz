import {
  createProjectMessage,
  findMessageById,
  findMessagesByChannel,
  findMessagesByAuthor,
  deleteMessage,
} from "../../../domains/projects/functions/project-message-operations.functions";
import { ChannelMessageSchema } from "../../../persistence/schemas/channel-messages.schema";

export async function handleCreateMessage(
  _: Electron.IpcMainEvent,
  data: Partial<ChannelMessageSchema>,
) {
  return await createProjectMessage(data);
}

export async function handleGetMessageById(
  _: Electron.IpcMainEvent,
  data: { id: string },
) {
  return await findMessageById(data.id);
}

export async function handleListMessagesByChannel(
  _: Electron.IpcMainEvent,
  data: { channelId: string; limit?: number },
) {
  return await findMessagesByChannel(data.channelId, data.limit);
}

export async function handleListMessagesByAuthor(
  _: Electron.IpcMainEvent,
  data: { authorId: string; channelId?: string },
) {
  return await findMessagesByAuthor(data.authorId, data.channelId);
}

export async function handleDeleteMessage(
  _: Electron.IpcMainEvent,
  data: { id: string; userId: string },
) {
  await deleteMessage(data.id, data.userId);
}
