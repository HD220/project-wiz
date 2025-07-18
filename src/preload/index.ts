/**
 * Preload script for secure IPC communication
 * Exposes authenticated API to renderer process
 */
import { contextBridge, ipcRenderer } from 'electron';
import type {
  LoginInput,
  RegisterInput,
  AuthResult,
  User,
  CreateProjectInput,
  Project,
  CreateAgentInput,
  Agent,
  CreateMessageInput,
  Message,
  CreateChannelInput,
  Channel,
  ApiResponse,
} from '../shared/types/common';

// Define the complete API interface
interface ProjectWizAPI {
  // Auth methods
  login: (data: LoginInput) => Promise<ApiResponse<AuthResult>>;
  register: (data: RegisterInput) => Promise<ApiResponse<AuthResult>>;
  validateToken: (token: string) => Promise<ApiResponse<{ userId: string; username: string }>>;
  getCurrentUser: (userId: string) => Promise<ApiResponse<User>>;
  logout: (userId: string) => Promise<ApiResponse<void>>;
  changePassword: (data: { userId: string; currentPassword: string; newPassword: string }) => Promise<ApiResponse<void>>;

  // Project methods
  createProject: (data: CreateProjectInput) => Promise<ApiResponse<Project>>;
  findProjectById: (projectId: string) => Promise<ApiResponse<Project | null>>;
  findProjectsByOwner: (ownerId: string) => Promise<ApiResponse<Project[]>>;
  findUserProjects: (userId: string) => Promise<ApiResponse<Project[]>>;
  updateProject: (data: { projectId: string; input: Partial<CreateProjectInput>; userId: string }) => Promise<ApiResponse<Project>>;
  archiveProject: (data: { projectId: string; userId: string }) => Promise<ApiResponse<void>>;
  deleteProject: (data: { projectId: string; userId: string }) => Promise<ApiResponse<void>>;
  addAgentToProject: (data: { projectId: string; agentId: string; role: string; userId: string }) => Promise<ApiResponse<void>>;
  removeAgentFromProject: (data: { projectId: string; agentId: string; userId: string }) => Promise<ApiResponse<void>>;

  // Agent methods
  createAgent: (data: CreateAgentInput) => Promise<ApiResponse<Agent>>;
  findAgentById: (agentId: string) => Promise<ApiResponse<Agent | null>>;
  findAgentsByCreator: (creatorId: string) => Promise<ApiResponse<Agent[]>>;
  findProjectAgents: (projectId: string) => Promise<ApiResponse<Agent[]>>;
  getAvailableAgents: (userId: string) => Promise<ApiResponse<Agent[]>>;
  updateAgent: (data: { agentId: string; input: Partial<CreateAgentInput>; userId: string }) => Promise<ApiResponse<Agent>>;
  updateAgentStatus: (data: { agentId: string; status: string }) => Promise<ApiResponse<void>>;
  deleteAgent: (data: { agentId: string; userId: string }) => Promise<ApiResponse<void>>;

  // Message methods
  createMessage: (data: CreateMessageInput) => Promise<ApiResponse<Message>>;
  getChannelMessages: (data: { channelId: string; limit?: number; before?: string }) => Promise<ApiResponse<Message[]>>;
  getDMMessages: (data: { dmConversationId: string; limit?: number; before?: string }) => Promise<ApiResponse<Message[]>>;
  findMessageById: (messageId: string) => Promise<ApiResponse<Message | null>>;
  updateMessage: (data: { messageId: string; content: string; authorId: string }) => Promise<ApiResponse<Message>>;
  deleteMessage: (data: { messageId: string; authorId: string }) => Promise<ApiResponse<void>>;

  // Channel methods (placeholder for future implementation)
  createChannel: (data: CreateChannelInput) => Promise<ApiResponse<Channel>>;
  findChannelById: (channelId: string) => Promise<ApiResponse<Channel | null>>;
  findProjectChannels: (projectId: string) => Promise<ApiResponse<Channel[]>>;
  updateChannel: (data: { channelId: string; input: Partial<CreateChannelInput>; userId: string }) => Promise<ApiResponse<Channel>>;
  deleteChannel: (data: { channelId: string; userId: string }) => Promise<ApiResponse<void>>;
}

// Implement the API
const api: ProjectWizAPI = {
  // Auth methods
  login: (data: LoginInput) => ipcRenderer.invoke('auth:login', data),
  register: (data: RegisterInput) => ipcRenderer.invoke('auth:register', data),
  validateToken: (token: string) => ipcRenderer.invoke('auth:validate-token', token),
  getCurrentUser: (userId: string) => ipcRenderer.invoke('auth:get-current-user', userId),
  logout: (userId: string) => ipcRenderer.invoke('auth:logout', userId),
  changePassword: (data: { userId: string; currentPassword: string; newPassword: string }) => 
    ipcRenderer.invoke('auth:change-password', data),

  // Project methods
  createProject: (data: CreateProjectInput) => ipcRenderer.invoke('projects:create', data),
  findProjectById: (projectId: string) => ipcRenderer.invoke('projects:find-by-id', projectId),
  findProjectsByOwner: (ownerId: string) => ipcRenderer.invoke('projects:find-by-owner', ownerId),
  findUserProjects: (userId: string) => ipcRenderer.invoke('projects:find-user-projects', userId),
  updateProject: (data: { projectId: string; input: Partial<CreateProjectInput>; userId: string }) => 
    ipcRenderer.invoke('projects:update', data),
  archiveProject: (data: { projectId: string; userId: string }) => 
    ipcRenderer.invoke('projects:archive', data),
  deleteProject: (data: { projectId: string; userId: string }) => 
    ipcRenderer.invoke('projects:delete', data),
  addAgentToProject: (data: { projectId: string; agentId: string; role: string; userId: string }) => 
    ipcRenderer.invoke('projects:add-agent', data),
  removeAgentFromProject: (data: { projectId: string; agentId: string; userId: string }) => 
    ipcRenderer.invoke('projects:remove-agent', data),

  // Agent methods
  createAgent: (data: CreateAgentInput) => ipcRenderer.invoke('agents:create', data),
  findAgentById: (agentId: string) => ipcRenderer.invoke('agents:find-by-id', agentId),
  findAgentsByCreator: (creatorId: string) => ipcRenderer.invoke('agents:find-by-creator', creatorId),
  findProjectAgents: (projectId: string) => ipcRenderer.invoke('agents:find-project-agents', projectId),
  getAvailableAgents: (userId: string) => ipcRenderer.invoke('agents:get-available', userId),
  updateAgent: (data: { agentId: string; input: Partial<CreateAgentInput>; userId: string }) => 
    ipcRenderer.invoke('agents:update', data),
  updateAgentStatus: (data: { agentId: string; status: string }) => 
    ipcRenderer.invoke('agents:update-status', data),
  deleteAgent: (data: { agentId: string; userId: string }) => 
    ipcRenderer.invoke('agents:delete', data),

  // Message methods
  createMessage: (data: CreateMessageInput) => ipcRenderer.invoke('messages:create', data),
  getChannelMessages: (data: { channelId: string; limit?: number; before?: string }) => 
    ipcRenderer.invoke('messages:get-channel-messages', data),
  getDMMessages: (data: { dmConversationId: string; limit?: number; before?: string }) => 
    ipcRenderer.invoke('messages:get-dm-messages', data),
  findMessageById: (messageId: string) => ipcRenderer.invoke('messages:find-by-id', messageId),
  updateMessage: (data: { messageId: string; content: string; authorId: string }) => 
    ipcRenderer.invoke('messages:update', data),
  deleteMessage: (data: { messageId: string; authorId: string }) => 
    ipcRenderer.invoke('messages:delete', data),

  // Channel methods (placeholder - will implement when we add channel service)
  createChannel: (data: CreateChannelInput) => 
    Promise.resolve({ success: false, error: 'Not implemented yet' }),
  findChannelById: (channelId: string) => 
    Promise.resolve({ success: false, error: 'Not implemented yet' }),
  findProjectChannels: (projectId: string) => 
    Promise.resolve({ success: false, error: 'Not implemented yet' }),
  updateChannel: (data: { channelId: string; input: Partial<CreateChannelInput>; userId: string }) => 
    Promise.resolve({ success: false, error: 'Not implemented yet' }),
  deleteChannel: (data: { channelId: string; userId: string }) => 
    Promise.resolve({ success: false, error: 'Not implemented yet' }),
};

// Expose API to renderer process
contextBridge.exposeInMainWorld('electronAPI', api);

// Type declaration for TypeScript
declare global {
  interface Window {
    electronAPI: ProjectWizAPI;
  }
}