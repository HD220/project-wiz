import { ipcRenderer } from "electron";

import type {
  MessageDto,
  CreateMessageDto,
} from "../../../shared/types/domains/users/message.types";

export interface IDirectMessageAPI {
  create: (data: CreateMessageDto) => Promise<MessageDto>;
  listByConversation: (
    conversationId: string,
    limit?: number,
    offset?: number,
  ) => Promise<MessageDto[]>;
  sendAI: (
    conversationId: string,
    content: string,
    userId?: string,
  ) => Promise<MessageDto | null>;
  sendAgent: (
    conversationId: string,
    message: string,
    userId?: string,
  ) => Promise<MessageDto | null>;
  regenerateResponse: (
    conversationId: string,
    userId?: string,
  ) => Promise<MessageDto | null>;
}

export function createDirectMessageAPI(): IDirectMessageAPI {
  return {
    create: createDirectMessage,
    listByConversation: listDirectMessagesByConversation,
    sendAI: sendAIMessage,
    sendAgent: sendAgentMessage,
    regenerateResponse: regenerateMessageResponse,
  };
}

function createDirectMessage(data: CreateMessageDto): Promise<MessageDto> {
  return ipcRenderer.invoke("dm:message:create", data);
}

function listDirectMessagesByConversation(
  conversationId: string,
  limit?: number,
  offset?: number,
): Promise<MessageDto[]> {
  return ipcRenderer.invoke("dm:message:listByConversation", {
    conversationId,
    limit,
    offset,
  });
}

function sendAIMessage(
  conversationId: string,
  content: string,
  userId?: string,
): Promise<MessageDto | null> {
  return ipcRenderer.invoke("dm:ai:sendMessage", {
    conversationId,
    content,
    userId,
  });
}

function sendAgentMessage(
  conversationId: string,
  message: string,
  userId?: string,
): Promise<MessageDto | null> {
  return ipcRenderer.invoke("dm:agent:sendMessage", {
    conversationId,
    message,
    userId,
  });
}

function regenerateMessageResponse(
  conversationId: string,
  userId?: string,
): Promise<MessageDto | null> {
  return ipcRenderer.invoke("dm:agent:regenerateResponse", {
    conversationId,
    userId,
  });
}
