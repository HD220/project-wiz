import { ipcRenderer } from "electron";

import type {
  MessageDto,
  CreateMessageDto,
} from "../../../shared/types/domains/users/message.types";

interface MessageMetadata {
  language?: string;
  filename?: string;
  source?: string;
}

export interface IChannelMessageAPI {
  create: (data: CreateMessageDto) => Promise<MessageDto>;
  getById: (id: string) => Promise<MessageDto | null>;
  listByChannel: (channelId: string, limit?: number) => Promise<MessageDto[]>;
  listByAuthor: (authorId: string, channelId?: string) => Promise<MessageDto[]>;
  delete: (id: string, userId: string) => Promise<void>;
  createText: (
    content: string,
    channelId: string,
    authorId: string,
    authorName: string,
  ) => Promise<MessageDto>;
  createCode: (
    content: string,
    channelId: string,
    authorId: string,
    authorName: string,
    metadata?: MessageMetadata,
  ) => Promise<MessageDto>;
  createSystem: (
    content: string,
    channelId: string,
    metadata?: MessageMetadata,
  ) => Promise<MessageDto>;
}

export function createChannelMessageAPI(): IChannelMessageAPI {
  return {
    create: createChannelMessage,
    getById: getChannelMessageById,
    listByChannel: listChannelMessagesByChannel,
    listByAuthor: listChannelMessagesByAuthor,
    delete: deleteChannelMessage,
    createText: createTextMessage,
    createCode: createCodeMessage,
    createSystem: createSystemMessage,
  };
}

function createChannelMessage(data: CreateMessageDto): Promise<MessageDto> {
  return ipcRenderer.invoke("channelMessage:create", data);
}

function getChannelMessageById(id: string): Promise<MessageDto | null> {
  return ipcRenderer.invoke("channelMessage:getById", { id });
}

function listChannelMessagesByChannel(
  channelId: string,
  limit?: number,
): Promise<MessageDto[]> {
  return ipcRenderer.invoke("channelMessage:listByChannel", {
    channelId,
    limit,
  });
}

function listChannelMessagesByAuthor(
  authorId: string,
  channelId?: string,
): Promise<MessageDto[]> {
  return ipcRenderer.invoke("channelMessage:listByAuthor", {
    authorId,
    channelId,
  });
}

function deleteChannelMessage(id: string, userId: string): Promise<void> {
  return ipcRenderer.invoke("channelMessage:delete", { id, userId });
}

function createTextMessage(
  content: string,
  channelId: string,
  authorId: string,
  authorName: string,
): Promise<MessageDto> {
  return ipcRenderer.invoke("channelMessage:createText", {
    content,
    channelId,
    authorId,
    authorName,
  });
}

function createCodeMessage(
  content: string,
  channelId: string,
  authorId: string,
  authorName: string,
  metadata?: MessageMetadata,
): Promise<MessageDto> {
  return ipcRenderer.invoke("channelMessage:createCode", {
    content,
    channelId,
    authorId,
    authorName,
    metadata,
  });
}

function createSystemMessage(
  content: string,
  channelId: string,
  metadata?: MessageMetadata,
): Promise<MessageDto> {
  return ipcRenderer.invoke("channelMessage:createSystem", {
    content,
    channelId,
    metadata,
  });
}
