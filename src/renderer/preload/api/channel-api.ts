import { ipcRenderer } from "electron";

import type {
  ChannelDto,
  CreateChannelDto,
} from "../../../shared/types/domains/projects/channel.types";

export interface IChannelAPI {
  create: (data: CreateChannelDto) => Promise<ChannelDto>;
  getById: (id: string) => Promise<ChannelDto | null>;
  listByProject: (projectId: string) => Promise<ChannelDto[]>;
  listAccessible: (projectId: string, userId: string) => Promise<ChannelDto[]>;
  createGeneral: (projectId: string, createdBy: string) => Promise<ChannelDto>;
  delete: (id: string) => Promise<void>;
}

export function createChannelAPI(): IChannelAPI {
  return {
    create: createChannel,
    getById: getChannelById,
    listByProject: listChannelsByProject,
    listAccessible: listAccessibleChannels,
    createGeneral: createGeneralChannel,
    delete: deleteChannel,
  };
}

function createChannel(data: CreateChannelDto): Promise<ChannelDto> {
  return ipcRenderer.invoke("channel:create", data);
}

function getChannelById(id: string): Promise<ChannelDto | null> {
  return ipcRenderer.invoke("channel:getById", { id });
}

function listChannelsByProject(projectId: string): Promise<ChannelDto[]> {
  return ipcRenderer.invoke("channel:listByProject", { projectId });
}

function listAccessibleChannels(
  projectId: string,
  userId: string,
): Promise<ChannelDto[]> {
  return ipcRenderer.invoke("channel:listAccessible", { projectId, userId });
}

function createGeneralChannel(
  projectId: string,
  createdBy: string,
): Promise<ChannelDto> {
  return ipcRenderer.invoke("channel:createGeneral", { projectId, createdBy });
}

function deleteChannel(id: string): Promise<void> {
  return ipcRenderer.invoke("channel:delete", { id });
}
