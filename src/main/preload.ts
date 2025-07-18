import { contextBridge, ipcRenderer } from "electron";
import type {
  LoginInput,
  RegisterInput,
  CreateAgentInput,
  UpdateAgentInput,
  CreateProjectInput,
  UpdateProjectInput,
  CreateChannelInput,
  UpdateChannelInput,
  SendMessageInput,
  ListOptions,
} from "../shared/schemas/validation.schemas";
// Types are used for TypeScript intellisense in the renderer process
// These imports are needed for type checking but not used at runtime

// Auth API
const authAPI = {
  login: (input: LoginInput) => ipcRenderer.invoke("auth:login", input),
  register: (input: RegisterInput) =>
    ipcRenderer.invoke("auth:register", input),
  logout: () => ipcRenderer.invoke("auth:logout"),
  validateToken: (token: string) =>
    ipcRenderer.invoke("auth:validate-token", token),
  listAccounts: () => ipcRenderer.invoke("auth:list-accounts"),
  isFirstRun: () => ipcRenderer.invoke("auth:is-first-run"),
  createDefaultAccount: () => ipcRenderer.invoke("auth:create-default-account"),
};

// Projects API
const projectsAPI = {
  create: (input: CreateProjectInput, userId: string) =>
    ipcRenderer.invoke("projects:create", input, userId),
  findById: (id: string) => ipcRenderer.invoke("projects:find-by-id", id),
  findByUser: (userId: string) =>
    ipcRenderer.invoke("projects:find-by-user", userId),
  update: (id: string, input: UpdateProjectInput, userId: string) =>
    ipcRenderer.invoke("projects:update", id, input, userId),
  archive: (id: string, userId: string) =>
    ipcRenderer.invoke("projects:archive", id, userId),
  delete: (id: string, userId: string) =>
    ipcRenderer.invoke("projects:delete", id, userId),
  initGit: (id: string, gitUrl?: string) =>
    ipcRenderer.invoke("projects:init-git", id, gitUrl),
  cloneRepository: (id: string, gitUrl: string) =>
    ipcRenderer.invoke("projects:clone-repository", id, gitUrl),
  addAgent: (
    projectId: string,
    agentId: string,
    role: string,
    userId: string,
  ) =>
    ipcRenderer.invoke("projects:add-agent", projectId, agentId, role, userId),
  removeAgent: (projectId: string, agentId: string) =>
    ipcRenderer.invoke("projects:remove-agent", projectId, agentId),
  listAgents: (projectId: string) =>
    ipcRenderer.invoke("projects:list-agents", projectId),
  listProjectAgents: (projectId: string) =>
    ipcRenderer.invoke("projects:list-project-agents", projectId),
};

// Agents API
const agentsAPI = {
  create: (input: CreateAgentInput, userId: string) =>
    ipcRenderer.invoke("agents:create", input, userId),
  findById: (id: string) => ipcRenderer.invoke("agents:find-by-id", id),
  listGlobal: (userId: string) =>
    ipcRenderer.invoke("agents:list-global", userId),
  listByProject: (projectId: string) =>
    ipcRenderer.invoke("agents:list-by-project", projectId),
  update: (id: string, input: UpdateAgentInput, userId: string) =>
    ipcRenderer.invoke("agents:update", id, input, userId),
  delete: (id: string, userId: string) =>
    ipcRenderer.invoke("agents:delete", id, userId),
  updateStatus: (id: string, status: "online" | "busy" | "offline") =>
    ipcRenderer.invoke("agents:update-status", id, status),
  start: (id: string) => ipcRenderer.invoke("agents:start", id),
  stop: (id: string) => ipcRenderer.invoke("agents:stop", id),
  getStatus: (id: string) => ipcRenderer.invoke("agents:get-status", id),
  sendMessage: (agentId: string, message: string) =>
    ipcRenderer.invoke("agents:send-message", agentId, message),
};

// Messages API
const messagesAPI = {
  send: (input: SendMessageInput, userId: string) =>
    ipcRenderer.invoke("messages:send", input, userId),
  listByChannel: (channelId: string, options?: ListOptions) =>
    ipcRenderer.invoke("messages:list-by-channel", channelId, options),
  listByDM: (conversationId: string, options?: ListOptions) =>
    ipcRenderer.invoke("messages:list-by-dm", conversationId, options),
  update: (id: string, content: string, userId: string) =>
    ipcRenderer.invoke("messages:update", id, content, userId),
  delete: (id: string, userId: string) =>
    ipcRenderer.invoke("messages:delete", id, userId),
  getOrCreateDM: (userId: string, agentId: string) =>
    ipcRenderer.invoke("messages:get-or-create-dm", userId, agentId),
  listDMConversations: (userId: string) =>
    ipcRenderer.invoke("messages:list-dm-conversations", userId),
  markAsRead: (conversationId: string, userId: string) =>
    ipcRenderer.invoke("messages:mark-as-read", conversationId, userId),
  subscribe: (channelId: string) =>
    ipcRenderer.invoke("messages:subscribe", channelId),
};

// Channels API
const channelsAPI = {
  create: (input: CreateChannelInput, userId: string) =>
    ipcRenderer.invoke("channels:create", input, userId),
  findById: (id: string) => ipcRenderer.invoke("channels:find-by-id", id),
  listByProject: (projectId: string) =>
    ipcRenderer.invoke("channels:list-by-project", projectId),
  update: (id: string, input: UpdateChannelInput, userId: string) =>
    ipcRenderer.invoke("channels:update", id, input, userId),
  delete: (id: string, userId: string) =>
    ipcRenderer.invoke("channels:delete", id, userId),
  reorder: (
    projectId: string,
    channelOrders: Array<{ id: string; position: number }>,
    userId: string,
  ) => ipcRenderer.invoke("channels:reorder", projectId, channelOrders, userId),
};

// Issues API
const issuesAPI = {
  create: (input: any) => ipcRenderer.invoke("issues:create", input),
  findById: (id: string) => ipcRenderer.invoke("issues:get", id),
  listByProject: (projectId: string) =>
    ipcRenderer.invoke("issues:get-project-issues", projectId),
  update: (id: string, input: any) =>
    ipcRenderer.invoke("issues:update", id, input),
  delete: (id: string) => ipcRenderer.invoke("issues:delete", id),
  updateStatus: (id: string, status: string) =>
    ipcRenderer.invoke("issues:update-status", id, status),
  assign: (id: string, assigneeId: string, assigneeType: string) =>
    ipcRenderer.invoke("issues:assign", id, assigneeId, assigneeType),
  addComment: (issueId: string, content: string) =>
    ipcRenderer.invoke("issues:add-comment", issueId, content),
  listComments: (issueId: string) =>
    ipcRenderer.invoke("issues:get-comments", issueId),
};

// Main API object
const api = {
  auth: authAPI,
  projects: projectsAPI,
  agents: agentsAPI,
  messages: messagesAPI,
  channels: channelsAPI,
  issues: issuesAPI,
};

// Expose API to renderer process
contextBridge.exposeInMainWorld("api", api);

// Type definitions for the exposed API
export type ElectronAPI = typeof api;

// Declare global window interface
declare global {
  interface Window {
    api: ElectronAPI;
  }
}
