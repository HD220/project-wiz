import {
  createConversation,
  findConversationById,
  findAllConversations,
  findOrCreateDirectMessage,
} from "../../../domains/users/functions";

import type { IpcMainInvokeEvent } from "electron";
import type { CreateConversationDto } from "../../../../shared/types";

export async function handleCreateConversation(
  _: IpcMainInvokeEvent,
  data: CreateConversationDto,
) {
  return await createConversation(data);
}

export async function handleGetConversationById(
  _: IpcMainInvokeEvent,
  data: { id: string },
) {
  return await findConversationById(data.id);
}

export async function handleListConversations() {
  return await findAllConversations();
}

export async function handleFindOrCreateConversation(
  _: IpcMainInvokeEvent,
  data: { participants: string[] },
) {
  return await findOrCreateDirectMessage(data.participants);
}
