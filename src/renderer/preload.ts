import { contextBridge, ipcRenderer, IpcRendererEvent } from "electron";

// Import types from shared (organized by domains)
import type {
  AgentDto,
  CreateAgentDto,
  UpdateAgentDto,
} from "../shared/types/domains/agents/agent.types";
import type {
  ProjectDto,
  CreateProjectDto,
  UpdateProjectDto,
} from "../shared/types/domains/projects/project.types";
import type {
  UserDto,
  CreateUserDto,
  UpdateUserDto,
  UserPreferencesDto,
} from "../shared/types/domains/users/user.types";
import type {
  LlmProviderDto,
  CreateLlmProviderDto,
  UpdateLlmProviderDto,
} from "../shared/types/domains/llm/llm-provider.types";
import type {
  ConversationDto,
  CreateConversationDto,
  MessageDto,
  CreateMessageDto,
} from "../shared/types/domains/users/message.types";
import type {
  ChannelDto,
  CreateChannelDto,
} from "../shared/types/domains/projects/channel.types";

// Import constants
import { IPC_CHANNELS } from "../shared/constants";

// Domain-specific interfaces
interface IAgentAPI {
  create: (data: CreateAgentDto) => Promise<AgentDto>;
  getById: (id: string) => Promise<AgentDto | null>;
  getByName: (name: string) => Promise<AgentDto | null>;
  list: (filter?: any) => Promise<AgentDto[]>;
  listActive: () => Promise<AgentDto[]>;
  update: (id: string, data: UpdateAgentDto) => Promise<AgentDto>;
  delete: (id: string) => Promise<void>;
  activate: (id: string) => Promise<void>;
  deactivate: (id: string) => Promise<void>;
  setDefault: (id: string) => Promise<void>;
  getDefault: () => Promise<AgentDto | null>;
}

interface IProjectAPI {
  create: (data: CreateProjectDto) => Promise<ProjectDto>;
  getById: (id: string) => Promise<ProjectDto | null>;
  list: (filter?: any) => Promise<ProjectDto[]>;
  update: (data: UpdateProjectDto) => Promise<ProjectDto>;
  delete: (id: string) => Promise<void>;
  archive: (id: string) => Promise<ProjectDto>;
}

interface IChannelAPI {
  create: (data: CreateChannelDto) => Promise<ChannelDto>;
  getById: (id: string) => Promise<ChannelDto | null>;
  listByProject: (projectId: string) => Promise<ChannelDto[]>;
  listAccessible: (projectId: string, userId: string) => Promise<ChannelDto[]>;
  createGeneral: (projectId: string, createdBy: string) => Promise<ChannelDto>;
  delete: (id: string) => Promise<void>;
}

interface IChannelMessageAPI {
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
    metadata?: any,
  ) => Promise<MessageDto>;
  createSystem: (
    content: string,
    channelId: string,
    metadata?: any,
  ) => Promise<MessageDto>;
}

interface IUserAPI {
  create: (data: CreateUserDto) => Promise<UserDto>;
  getById: (id: string) => Promise<UserDto | null>;
  updateProfile: (id: string, data: UpdateUserDto) => Promise<void>;
  updateSettings: (id: string, settings: any) => Promise<void>;
  getPreferences: (userId: string) => Promise<UserPreferencesDto | null>;
  delete: (id: string) => Promise<void>;
}

interface IConversationAPI {
  create: (data: CreateConversationDto) => Promise<ConversationDto>;
  getById: (id: string) => Promise<ConversationDto | null>;
  list: () => Promise<ConversationDto[]>;
  findOrCreate: (participants: string[]) => Promise<ConversationDto>;
}

interface IDirectMessageAPI {
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

interface ILlmProviderAPI {
  create: (data: CreateLlmProviderDto) => Promise<LlmProviderDto>;
  getById: (id: string) => Promise<LlmProviderDto | null>;
  list: (filter?: any) => Promise<LlmProviderDto[]>;
  update: (id: string, data: UpdateLlmProviderDto) => Promise<LlmProviderDto>;
  delete: (id: string) => Promise<void>;
  setDefault: (id: string) => Promise<LlmProviderDto>;
  getDefault: () => Promise<LlmProviderDto | null>;
}

interface IWindowAPI {
  minimize: () => Promise<void>;
  maximize: () => Promise<void>;
  close: () => Promise<void>;
  isMaximized: () => Promise<boolean>;
  isDev: () => Promise<boolean>;
}

// Main IPC interface
export interface IElectronIPC {
  // Domain APIs
  agents: IAgentAPI;
  projects: IProjectAPI;
  channels: IChannelAPI;
  channelMessages: IChannelMessageAPI;
  users: IUserAPI;
  conversations: IConversationAPI;
  directMessages: IDirectMessageAPI;
  llmProviders: ILlmProviderAPI;
  window: IWindowAPI;

  // Generic functions for advanced use
  invoke: <Channel, Payload, Response>(
    channel: Channel,
    ...args: Payload[]
  ) => Promise<Response>;
  on: (
    channel: string,
    listener: <EventResponse>(
      event: IpcRendererEvent,
      ...args: EventResponse[]
    ) => void,
  ) => () => void;
  send: <Channel, Payload>(channel: Channel, ...args: Payload[]) => void;
  removeAllListeners: <Channel>(channel: Channel) => void;
}

const electronIPC: IElectronIPC = {
  // Agent API
  agents: {
    create: (data) => ipcRenderer.invoke(IPC_CHANNELS.AGENT_CREATE, data),
    getById: (id) => ipcRenderer.invoke(IPC_CHANNELS.AGENT_GET_BY_ID, { id }),
    getByName: (name) =>
      ipcRenderer.invoke(IPC_CHANNELS.AGENT_GET_BY_NAME, { name }),
    list: (filter) => ipcRenderer.invoke(IPC_CHANNELS.AGENT_LIST, filter),
    listActive: () => ipcRenderer.invoke(IPC_CHANNELS.AGENT_LIST_ACTIVE),
    update: (id, data) =>
      ipcRenderer.invoke(IPC_CHANNELS.AGENT_UPDATE, { id, ...data }),
    delete: (id) => ipcRenderer.invoke(IPC_CHANNELS.AGENT_DELETE, { id }),
    activate: (id) => ipcRenderer.invoke(IPC_CHANNELS.AGENT_ACTIVATE, { id }),
    deactivate: (id) =>
      ipcRenderer.invoke(IPC_CHANNELS.AGENT_DEACTIVATE, { id }),
    setDefault: (id) =>
      ipcRenderer.invoke(IPC_CHANNELS.AGENT_SET_DEFAULT, { id }),
    getDefault: () => ipcRenderer.invoke(IPC_CHANNELS.AGENT_GET_DEFAULT),
  },

  // Project API
  projects: {
    create: (data) => ipcRenderer.invoke("project:create", data),
    getById: (id) => ipcRenderer.invoke("project:getById", { id }),
    list: (filter) => ipcRenderer.invoke("project:list", filter),
    update: (data) => ipcRenderer.invoke("project:update", data),
    delete: (id) => ipcRenderer.invoke("project:delete", { id }),
    archive: (id) => ipcRenderer.invoke("project:archive", { id }),
  },

  // Channel API
  channels: {
    create: (data) => ipcRenderer.invoke("channel:create", data),
    getById: (id) => ipcRenderer.invoke("channel:getById", { id }),
    listByProject: (projectId) =>
      ipcRenderer.invoke("channel:listByProject", { projectId }),
    listAccessible: (projectId, userId) =>
      ipcRenderer.invoke("channel:listAccessible", { projectId, userId }),
    createGeneral: (projectId, createdBy) =>
      ipcRenderer.invoke("channel:createGeneral", { projectId, createdBy }),
    delete: (id) => ipcRenderer.invoke("channel:delete", { id }),
  },

  // Channel Message API
  channelMessages: {
    create: (data) => ipcRenderer.invoke("channelMessage:create", data),
    getById: (id) => ipcRenderer.invoke("channelMessage:getById", { id }),
    listByChannel: (channelId, limit) =>
      ipcRenderer.invoke("channelMessage:listByChannel", { channelId, limit }),
    listByAuthor: (authorId, channelId) =>
      ipcRenderer.invoke("channelMessage:listByAuthor", {
        authorId,
        channelId,
      }),
    delete: (id, userId) =>
      ipcRenderer.invoke("channelMessage:delete", { id, userId }),
    createText: (content, channelId, authorId, authorName) =>
      ipcRenderer.invoke("channelMessage:createText", {
        content,
        channelId,
        authorId,
        authorName,
      }),
    createCode: (content, channelId, authorId, authorName, metadata) =>
      ipcRenderer.invoke("channelMessage:createCode", {
        content,
        channelId,
        authorId,
        authorName,
        metadata,
      }),
    createSystem: (content, channelId, metadata) =>
      ipcRenderer.invoke("channelMessage:createSystem", {
        content,
        channelId,
        metadata,
      }),
  },

  // User API
  users: {
    create: (data) => ipcRenderer.invoke("user:create", data),
    getById: (id) => ipcRenderer.invoke("user:getById", { id }),
    updateProfile: (id, data) =>
      ipcRenderer.invoke("user:updateProfile", { ...data, id }),
    updateSettings: (id, settings) =>
      ipcRenderer.invoke("user:updateSettings", { id, settings }),
    getPreferences: (userId) =>
      ipcRenderer.invoke("user:getPreferences", { userId }),
    delete: (id) => ipcRenderer.invoke("user:delete", { id }),
  },

  // Conversation API
  conversations: {
    create: (data) => ipcRenderer.invoke("dm:conversation:create", data),
    getById: (id) => ipcRenderer.invoke("dm:conversation:getById", { id }),
    list: () => ipcRenderer.invoke("dm:conversation:list"),
    findOrCreate: (participants) =>
      ipcRenderer.invoke("dm:conversation:findOrCreate", { participants }),
  },

  // Direct Message API
  directMessages: {
    create: (data) => ipcRenderer.invoke("dm:message:create", data),
    listByConversation: (conversationId, limit, offset) =>
      ipcRenderer.invoke("dm:message:listByConversation", {
        conversationId,
        limit,
        offset,
      }),
    sendAI: (conversationId, content, userId) =>
      ipcRenderer.invoke("dm:ai:sendMessage", {
        conversationId,
        content,
        userId,
      }),
    sendAgent: (conversationId, message, userId) =>
      ipcRenderer.invoke("dm:agent:sendMessage", {
        conversationId,
        message,
        userId,
      }),
    regenerateResponse: (conversationId, userId) =>
      ipcRenderer.invoke("dm:agent:regenerateResponse", {
        conversationId,
        userId,
      }),
  },

  // LLM Provider API
  llmProviders: {
    create: (data) => ipcRenderer.invoke("llm-provider:create", data),
    getById: (id) => ipcRenderer.invoke("llm-provider:getById", { id }),
    list: (filter) => ipcRenderer.invoke("llm-provider:list", filter),
    update: (id, data) =>
      ipcRenderer.invoke("llm-provider:update", { ...data, id }),
    delete: (id) => ipcRenderer.invoke("llm-provider:delete", { id }),
    setDefault: (id) => ipcRenderer.invoke("llm-provider:setDefault", { id }),
    getDefault: () => ipcRenderer.invoke("llm-provider:getDefault"),
  },

  // Window API
  window: {
    minimize: () => ipcRenderer.invoke(IPC_CHANNELS.WINDOW_MINIMIZE),
    maximize: () => ipcRenderer.invoke(IPC_CHANNELS.WINDOW_MAXIMIZE),
    close: () => ipcRenderer.invoke(IPC_CHANNELS.WINDOW_CLOSE),
    isMaximized: () => ipcRenderer.invoke(IPC_CHANNELS.WINDOW_IS_MAXIMIZED),
    isDev: () => ipcRenderer.invoke(IPC_CHANNELS.APP_IS_DEV),
  },

  // Generic functions for advanced use
  invoke: function <Channel, Payload, Response>(
    channel: Channel,
    ...args: Payload[]
  ): Promise<Response> {
    return ipcRenderer.invoke(channel as string, ...args);
  },
  on: function (
    channel: string,
    listener: <EventResponse>(
      event: IpcRendererEvent,
      ...args: EventResponse[]
    ) => void,
  ): () => void {
    ipcRenderer.on(channel, listener);
    return () => ipcRenderer.removeListener(channel, listener);
  },
  send: function <Channel, Payload>(
    channel: Channel,
    ...args: Payload[]
  ): void {
    ipcRenderer.send(channel as string, ...args);
  },
  removeAllListeners: function <Channel>(channel: Channel): void {
    ipcRenderer.removeAllListeners(channel as string);
  },
};

// Expose the API to the renderer process
try {
  contextBridge.exposeInMainWorld("electronIPC", electronIPC);
  console.log("[Preload] electronIPC exposed successfully.");
} catch (error) {
  console.error("[Preload] Failed to expose electronIPC:", error);
}
