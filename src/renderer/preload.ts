// Preload script for Electron
// This script has access to node.js APIs and will be executed before the renderer process loads

import { contextBridge, ipcRenderer } from "electron";

import type { AgentFiltersInput } from "@/main/features/agent/agent.schema";
import type {
  CreateAgentInput,
  AgentStatus,
} from "@/main/features/agent/agent.types";
// Memory removed
import type {
  LoginCredentials,
  RegisterUserInput,
} from "@/main/features/auth/auth.types";
import type { CreateDMConversationInput } from "@/main/features/dm/dm-conversation.types";
import type { CreateProviderInput } from "@/main/features/llm-provider/llm-provider.types";
import type { CreateProjectChannelInput } from "@/main/features/project/project-channel.types";
import type {
  InsertProject,
  UpdateProject,
} from "@/main/features/project/project.types";
import type { Theme } from "@/main/features/user/user.types";
import type { IpcResponse } from "@/main/types";

import type { ProviderFiltersInput } from "@/renderer/features/agent/provider.schema";

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld("api", {
  // System information
  platform: process.platform,
  version: process.versions.electron,

  // Authentication API (Desktop - session managed by main process)
  auth: {
    register: (input: RegisterUserInput): Promise<IpcResponse> =>
      ipcRenderer.invoke("auth:register", input),
    login: (credentials: LoginCredentials): Promise<IpcResponse> =>
      ipcRenderer.invoke("auth:login", credentials),
    getCurrentUser: (): Promise<IpcResponse> =>
      ipcRenderer.invoke("auth:getCurrentUser"),
    getActiveSession: (): Promise<IpcResponse> =>
      ipcRenderer.invoke("auth:getActiveSession"),
    logout: (): Promise<IpcResponse> => ipcRenderer.invoke("auth:logout"),
    isLoggedIn: (): Promise<IpcResponse> =>
      ipcRenderer.invoke("auth:isLoggedIn"),
    getUserById: (userId: string): Promise<IpcResponse> =>
      ipcRenderer.invoke("auth:getUserById", userId),
  },

  // Profile API
  profile: {
    getTheme: (): Promise<IpcResponse> =>
      ipcRenderer.invoke("profile:getTheme"),
    updateTheme: (theme: Theme): Promise<IpcResponse> =>
      ipcRenderer.invoke("profile:updateTheme", theme),
  },

  // Users API
  users: {
    listAvailableUsers: (): Promise<IpcResponse> =>
      ipcRenderer.invoke("user:listAvailableUsers"),
  },

  // Projects API
  projects: {
    create: (input: InsertProject): Promise<IpcResponse> =>
      ipcRenderer.invoke("projects:create", input),
    findById: (id: string): Promise<IpcResponse> =>
      ipcRenderer.invoke("projects:findById", id),
    listAll: (): Promise<IpcResponse> => ipcRenderer.invoke("projects:listAll"),
    update: (input: UpdateProject): Promise<IpcResponse> =>
      ipcRenderer.invoke("projects:update", input),
    archive: (id: string): Promise<IpcResponse> =>
      ipcRenderer.invoke("projects:archive", id),
  },

  // DM Conversations API
  dm: {
    create: (input: CreateDMConversationInput): Promise<IpcResponse> =>
      ipcRenderer.invoke("dm:create", input),
    getUserConversations: (options?: {
      includeInactive?: boolean;
      includeArchived?: boolean;
    }): Promise<IpcResponse> =>
      ipcRenderer.invoke("dm:getUserConversations", options),
    findById: (dmId: string): Promise<IpcResponse> =>
      ipcRenderer.invoke("dm:findById", dmId),
    archive: (dmId: string): Promise<IpcResponse> =>
      ipcRenderer.invoke("dm:archive", dmId),
    unarchive: (dmId: string): Promise<IpcResponse> =>
      ipcRenderer.invoke("dm:unarchive", dmId),
    sendMessage: (dmId: string, content: string): Promise<IpcResponse> =>
      ipcRenderer.invoke("dm:sendMessage", dmId, content),
    getMessages: (dmId: string): Promise<IpcResponse> =>
      ipcRenderer.invoke("dm:getMessages", dmId),
    addParticipant: (
      dmId: string,
      participantId: string,
    ): Promise<IpcResponse> =>
      ipcRenderer.invoke("dm:addParticipant", dmId, participantId),
    removeParticipant: (
      dmId: string,
      participantId: string,
    ): Promise<IpcResponse> =>
      ipcRenderer.invoke("dm:removeParticipant", dmId, participantId),
    delete: (dmId: string): Promise<IpcResponse> =>
      ipcRenderer.invoke("dm:delete", dmId),
  },

  // Project Channels API
  channels: {
    create: (input: CreateProjectChannelInput): Promise<IpcResponse> =>
      ipcRenderer.invoke("channels:create", input),
    getProjectChannels: (
      projectId: string,
      options?: {
        includeInactive?: boolean;
        includeArchived?: boolean;
      },
    ): Promise<IpcResponse> =>
      ipcRenderer.invoke("channels:getProjectChannels", projectId, options),
    findById: (channelId: string): Promise<IpcResponse> =>
      ipcRenderer.invoke("channels:findById", channelId),
    update: (
      channelId: string,
      updates: { name?: string; description?: string },
    ): Promise<IpcResponse> =>
      ipcRenderer.invoke("channels:update", channelId, updates),
    archive: (channelId: string): Promise<IpcResponse> =>
      ipcRenderer.invoke("channels:archive", channelId),
    unarchive: (channelId: string): Promise<IpcResponse> =>
      ipcRenderer.invoke("channels:unarchive", channelId),
    sendMessage: (channelId: string, content: string): Promise<IpcResponse> =>
      ipcRenderer.invoke("channels:sendMessage", channelId, content),
    getMessages: (channelId: string): Promise<IpcResponse> =>
      ipcRenderer.invoke("channels:getMessages", channelId),
    delete: (channelId: string): Promise<IpcResponse> =>
      ipcRenderer.invoke("channels:delete", channelId),
  },

  // LLM Providers API
  llmProviders: {
    create: (input: CreateProviderInput): Promise<IpcResponse> =>
      ipcRenderer.invoke("llm-providers:create", input),
    list: (filters?: ProviderFiltersInput): Promise<IpcResponse> =>
      ipcRenderer.invoke("llm-providers:list", filters),
    get: (id: string): Promise<IpcResponse> =>
      ipcRenderer.invoke("llm-providers:getById", id),
    getById: (id: string): Promise<IpcResponse> =>
      ipcRenderer.invoke("llm-providers:getById", id),
    update: (
      id: string,
      updates: Partial<CreateProviderInput>,
    ): Promise<IpcResponse> =>
      ipcRenderer.invoke("llm-providers:update", id, updates),
    delete: (id: string): Promise<IpcResponse> =>
      ipcRenderer.invoke("llm-providers:delete", id),
    setDefault: (providerId: string): Promise<IpcResponse> =>
      ipcRenderer.invoke("llm-providers:setDefault", providerId),
    getDefault: (): Promise<IpcResponse> =>
      ipcRenderer.invoke("llm-providers:getDefault"),
  },

  // Agents API
  agents: {
    create: (input: CreateAgentInput): Promise<IpcResponse> =>
      ipcRenderer.invoke("agents:create", input),
    list: (filters?: AgentFiltersInput): Promise<IpcResponse> =>
      ipcRenderer.invoke("agents:list", filters),
    get: (id: string): Promise<IpcResponse> =>
      ipcRenderer.invoke("agents:get", id),
    getWithProvider: (id: string): Promise<IpcResponse> =>
      ipcRenderer.invoke("agents:getWithProvider", id),
    updateStatus: (id: string, status: AgentStatus): Promise<IpcResponse> =>
      ipcRenderer.invoke("agents:updateStatus", id, status),
    update: (
      id: string,
      updates: Partial<CreateAgentInput>,
    ): Promise<IpcResponse> => ipcRenderer.invoke("agents:update", id, updates),
    delete: (id: string): Promise<IpcResponse> =>
      ipcRenderer.invoke("agents:delete", id),
    restore: (id: string): Promise<IpcResponse> =>
      ipcRenderer.invoke("agents:restore", id),
  },

  // General invoke method
  invoke: (channel: string, ...args: unknown[]): Promise<IpcResponse> =>
    ipcRenderer.invoke(channel, ...args),
});

// Expose window control APIs
contextBridge.exposeInMainWorld("electronAPI", {
  window: {
    minimize: () => ipcRenderer.invoke("window:minimize"),
    maximize: () => ipcRenderer.invoke("window:maximize"),
    toggleMaximize: () => ipcRenderer.invoke("window:toggle-maximize"),
    close: () => ipcRenderer.invoke("window:close"),
  },
});
