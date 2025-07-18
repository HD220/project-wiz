import { ipcRenderer } from "electron";

import type {
  ChannelDto,
  CreateChannelDto,
} from "../../../shared/types/projects/channel.types";

export interface IChannelAPI {
  createForProject: (
    projectId: string,
    data: Omit<CreateChannelDto, "projectId">,
  ) => Promise<ChannelDto>;
  getById: (id: string) => Promise<ChannelDto | null>;
  listByProject: (projectId: string) => Promise<ChannelDto[]>;
  listAccessibleByProject: (projectId: string) => Promise<ChannelDto[]>;
  createGeneralForProject: (projectId: string) => Promise<ChannelDto>;
  delete: (id: string) => Promise<void>;
}

export function createChannelAPI(): IChannelAPI {
  return {
    createForProject: createChannelForProject,
    getById: getChannelById,
    listByProject: listChannelsByProject,
    listAccessibleByProject: listAccessibleChannelsByProject,
    createGeneralForProject: createGeneralChannelForProject,
    delete: deleteChannel,
  };
}

function createChannelForProject(
  projectId: string,
  data: Omit<CreateChannelDto, "projectId">,
): Promise<ChannelDto> {
  return ipcRenderer.invoke("project:createChannel", {
    projectId,
    name: data.name,
    description: data.description,
  });
}

function getChannelById(id: string): Promise<ChannelDto | null> {
  return ipcRenderer.invoke("channel:getById", { id });
}

function listChannelsByProject(projectId: string): Promise<ChannelDto[]> {
  return ipcRenderer.invoke("project:listChannels", { projectId });
}

function listAccessibleChannelsByProject(
  projectId: string,
): Promise<ChannelDto[]> {
  return ipcRenderer.invoke("project:listAccessibleChannels", { projectId });
}

function createGeneralChannelForProject(
  projectId: string,
): Promise<ChannelDto> {
  return ipcRenderer.invoke("project:createGeneralChannel", { projectId });
}

function deleteChannel(id: string): Promise<void> {
  return ipcRenderer.invoke("channel:delete", { id });
}
