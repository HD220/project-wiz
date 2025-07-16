import { ipcRenderer } from "electron";

import { IPC_CHANNELS } from "../../../shared/constants";

import type {
  AgentDto,
  CreateAgentDto,
  UpdateAgentDto,
  AgentFilterDto,
} from "../../../shared/types/domains/agents/agent.types";

export interface IAgentAPI {
  create: (data: CreateAgentDto) => Promise<AgentDto>;
  getById: (id: string) => Promise<AgentDto | null>;
  getByName: (name: string) => Promise<AgentDto | null>;
  list: (filter?: AgentFilterDto) => Promise<AgentDto[]>;
  listActive: () => Promise<AgentDto[]>;
  update: (id: string, data: UpdateAgentDto) => Promise<AgentDto>;
  delete: (id: string) => Promise<void>;
  activate: (id: string) => Promise<void>;
  deactivate: (id: string) => Promise<void>;
  setDefault: (id: string) => Promise<void>;
  getDefault: () => Promise<AgentDto | null>;
}

export function createAgentAPI(): IAgentAPI {
  return {
    create: createAgent,
    getById: getAgentById,
    getByName: getAgentByName,
    list: listAgents,
    listActive: listActiveAgents,
    update: updateAgent,
    delete: deleteAgent,
    activate: activateAgent,
    deactivate: deactivateAgent,
    setDefault: setDefaultAgent,
    getDefault: getDefaultAgent,
  };
}

function createAgent(data: CreateAgentDto): Promise<AgentDto> {
  return ipcRenderer.invoke(IPC_CHANNELS.AGENT_CREATE, data);
}

function getAgentById(id: string): Promise<AgentDto | null> {
  return ipcRenderer.invoke(IPC_CHANNELS.AGENT_GET_BY_ID, { id });
}

function getAgentByName(name: string): Promise<AgentDto | null> {
  return ipcRenderer.invoke(IPC_CHANNELS.AGENT_GET_BY_NAME, { name });
}

function listAgents(filter?: AgentFilterDto): Promise<AgentDto[]> {
  return ipcRenderer.invoke(IPC_CHANNELS.AGENT_LIST, filter);
}

function listActiveAgents(): Promise<AgentDto[]> {
  return ipcRenderer.invoke(IPC_CHANNELS.AGENT_LIST_ACTIVE);
}

function updateAgent(id: string, data: UpdateAgentDto): Promise<AgentDto> {
  return ipcRenderer.invoke(IPC_CHANNELS.AGENT_UPDATE, { id, ...data });
}

function deleteAgent(id: string): Promise<void> {
  return ipcRenderer.invoke(IPC_CHANNELS.AGENT_DELETE, { id });
}

function activateAgent(id: string): Promise<void> {
  return ipcRenderer.invoke(IPC_CHANNELS.AGENT_ACTIVATE, { id });
}

function deactivateAgent(id: string): Promise<void> {
  return ipcRenderer.invoke(IPC_CHANNELS.AGENT_DEACTIVATE, { id });
}

function setDefaultAgent(id: string): Promise<void> {
  return ipcRenderer.invoke(IPC_CHANNELS.AGENT_SET_DEFAULT, { id });
}

function getDefaultAgent(): Promise<AgentDto | null> {
  return ipcRenderer.invoke(IPC_CHANNELS.AGENT_GET_DEFAULT);
}
