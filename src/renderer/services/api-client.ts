import type { ApiResponse } from "../../shared/types/common";

// Base API client with common error handling
export class BaseApiClient {
  protected static async handleResponse<T>(
    response: ApiResponse<T>,
    errorMessage: string,
  ): Promise<T> {
    if (!response.success) {
      throw new Error(response.error?.message || errorMessage);
    }
    return response.data!;
  }
}

// Global API definitions for window.electronAPI
declare global {
  interface Window {
    electronAPI: {
      // Auth methods
      login: (data: any) => Promise<ApiResponse<any>>;
      register: (data: any) => Promise<ApiResponse<any>>;
      validateToken: (token: string) => Promise<ApiResponse<any>>;
      getCurrentUser: (userId: string) => Promise<ApiResponse<any>>;
      logout: (userId: string) => Promise<ApiResponse<void>>;
      changePassword: (data: any) => Promise<ApiResponse<void>>;

      // Project methods
      createProject: (data: any) => Promise<ApiResponse<any>>;
      findProjectById: (projectId: string) => Promise<ApiResponse<any>>;
      findProjectsByOwner: (ownerId: string) => Promise<ApiResponse<any[]>>;
      findUserProjects: (userId: string) => Promise<ApiResponse<any[]>>;
      updateProject: (data: any) => Promise<ApiResponse<any>>;
      archiveProject: (data: any) => Promise<ApiResponse<void>>;
      deleteProject: (data: any) => Promise<ApiResponse<void>>;
      addAgentToProject: (data: any) => Promise<ApiResponse<void>>;
      removeAgentFromProject: (data: any) => Promise<ApiResponse<void>>;

      // Agent methods
      createAgent: (data: any) => Promise<ApiResponse<any>>;
      findAgentById: (agentId: string) => Promise<ApiResponse<any>>;
      findAgentsByCreator: (creatorId: string) => Promise<ApiResponse<any[]>>;
      findProjectAgents: (projectId: string) => Promise<ApiResponse<any[]>>;
      getAvailableAgents: (userId: string) => Promise<ApiResponse<any[]>>;
      updateAgent: (data: any) => Promise<ApiResponse<any>>;
      updateAgentStatus: (data: any) => Promise<ApiResponse<void>>;
      deleteAgent: (data: any) => Promise<ApiResponse<void>>;

      // Message methods
      createMessage: (data: any) => Promise<ApiResponse<any>>;
      getChannelMessages: (data: any) => Promise<ApiResponse<any[]>>;
      getDMMessages: (data: any) => Promise<ApiResponse<any[]>>;
      findMessageById: (messageId: string) => Promise<ApiResponse<any>>;
      updateMessage: (data: any) => Promise<ApiResponse<any>>;
      deleteMessage: (data: any) => Promise<ApiResponse<void>>;

      // Channel methods
      createChannel: (data: any) => Promise<ApiResponse<any>>;
      findChannelById: (channelId: string) => Promise<ApiResponse<any>>;
      findProjectChannels: (projectId: string) => Promise<ApiResponse<any[]>>;
      updateChannel: (data: any) => Promise<ApiResponse<any>>;
      deleteChannel: (data: any) => Promise<ApiResponse<void>>;
    };
  }
}
