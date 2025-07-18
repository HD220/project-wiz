import { ipcRenderer } from "electron";

import type {
  ConversationDto,
  CreateConversationDto,
} from "../../../shared/types/users/message.types";

export interface IConversationAPI {
  create: (data: CreateConversationDto) => Promise<ConversationDto>;
  getById: (id: string) => Promise<ConversationDto | null>;
  list: () => Promise<ConversationDto[]>;
  findOrCreate: (participants: string[]) => Promise<ConversationDto>;
}

export function createConversationAPI(): IConversationAPI {
  return {
    create: createConversation,
    getById: getConversationById,
    list: listConversations,
    findOrCreate: findOrCreateConversation,
  };
}

function createConversation(
  data: CreateConversationDto,
): Promise<ConversationDto> {
  return ipcRenderer.invoke("dm:conversation:create", data);
}

function getConversationById(id: string): Promise<ConversationDto | null> {
  return ipcRenderer.invoke("dm:conversation:getById", { id });
}

function listConversations(): Promise<ConversationDto[]> {
  return ipcRenderer.invoke("dm:conversation:list");
}

function findOrCreateConversation(
  participants: string[],
): Promise<ConversationDto> {
  return ipcRenderer.invoke("dm:conversation:findOrCreate", { participants });
}
