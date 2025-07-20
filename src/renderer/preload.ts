// Preload script for Electron
// This script has access to node.js APIs and will be executed before the renderer process loads

import { contextBridge, ipcRenderer } from "electron";

import type { CreateAgentInput, AgentStatus } from "@/main/agents/agent.types";
import type { CreateProviderInput } from "@/main/agents/llm-providers/llm-provider.types";
import type { CreateConversationInput } from "@/main/conversations/conversation.service";
import type { SendMessageInput } from "@/main/conversations/message.service";
import type {
  InsertProject,
  UpdateProject,
} from "@/main/project/projects.schema";
import type { IpcResponse } from "@/main/types";
import type {
  LoginCredentials,
  RegisterUserInput,
} from "@/main/user/authentication/auth.types";
import type { Theme } from "@/main/user/profile/user-preferences.schema";

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld("api", {
  // System information
  platform: process.platform,
  version: process.versions.electron,

  // Authentication API
  auth: {
    register: (input: RegisterUserInput): Promise<IpcResponse> =>
      ipcRenderer.invoke("auth:register", input),
    login: (credentials: LoginCredentials): Promise<IpcResponse> =>
      ipcRenderer.invoke("auth:login", credentials),
    getCurrentUser: (): Promise<IpcResponse> =>
      ipcRenderer.invoke("auth:getCurrentUser"),
    logout: (): Promise<IpcResponse> => ipcRenderer.invoke("auth:logout"),
    isLoggedIn: (): Promise<IpcResponse> =>
      ipcRenderer.invoke("auth:isLoggedIn"),
    getUserById: (userId: string): Promise<IpcResponse> =>
      ipcRenderer.invoke("auth:getUserById", userId),
  },

  // Profile API
  profile: {
    getTheme: (userId: string): Promise<IpcResponse> =>
      ipcRenderer.invoke("profile:getTheme", userId),
    updateTheme: (userId: string, theme: Theme): Promise<IpcResponse> =>
      ipcRenderer.invoke("profile:updateTheme", userId, theme),
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

  // Conversations API
  conversations: {
    create: (input: CreateConversationInput): Promise<IpcResponse> =>
      ipcRenderer.invoke("conversations:create", input),
    getUserConversations: (userId: string): Promise<IpcResponse> =>
      ipcRenderer.invoke("conversations:getUserConversations", userId),
  },

  // Messages API
  messages: {
    send: (input: SendMessageInput): Promise<IpcResponse> =>
      ipcRenderer.invoke("messages:send", input),
    getConversationMessages: (conversationId: string): Promise<IpcResponse> =>
      ipcRenderer.invoke("messages:getConversationMessages", conversationId),
  },

  // LLM Providers API
  llmProviders: {
    create: (input: CreateProviderInput): Promise<IpcResponse> =>
      ipcRenderer.invoke("llm-providers:create", input),
    list: (userId: string): Promise<IpcResponse> =>
      ipcRenderer.invoke("llm-providers:list", userId),
    getById: (id: string): Promise<IpcResponse> =>
      ipcRenderer.invoke("llm-providers:getById", id),
    update: (
      id: string,
      updates: Partial<CreateProviderInput>,
    ): Promise<IpcResponse> =>
      ipcRenderer.invoke("llm-providers:update", id, updates),
    delete: (id: string): Promise<IpcResponse> =>
      ipcRenderer.invoke("llm-providers:delete", id),
    setDefault: (providerId: string, userId: string): Promise<IpcResponse> =>
      ipcRenderer.invoke("llm-providers:setDefault", providerId, userId),
    getDefault: (userId: string): Promise<IpcResponse> =>
      ipcRenderer.invoke("llm-providers:getDefault", userId),
  },

  // Agents API
  agents: {
    create: (input: CreateAgentInput): Promise<IpcResponse> =>
      ipcRenderer.invoke("agents:create", input),
    list: (): Promise<IpcResponse> => ipcRenderer.invoke("agents:list"),
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
  },
});

console.log("Preload script loaded successfully");
