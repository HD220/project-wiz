import type {
  ApiResponse,
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
} from "../../shared/types/common";

declare global {
  interface Window {
    electronAPI: {
      // Auth methods
      login: (data: LoginInput) => Promise<ApiResponse<AuthResult>>;
      register: (data: RegisterInput) => Promise<ApiResponse<AuthResult>>;
      validateToken: (
        token: string,
      ) => Promise<ApiResponse<{ userId: string; username: string }>>;
      getCurrentUser: (userId: string) => Promise<ApiResponse<User>>;
      logout: (userId: string) => Promise<ApiResponse<void>>;
      changePassword: (data: {
        userId: string;
        currentPassword: string;
        newPassword: string;
      }) => Promise<ApiResponse<void>>;

      // Project methods
      createProject: (
        data: CreateProjectInput,
      ) => Promise<ApiResponse<Project>>;
      findProjectById: (
        projectId: string,
      ) => Promise<ApiResponse<Project | null>>;
      findProjectsByOwner: (ownerId: string) => Promise<ApiResponse<Project[]>>;
      findUserProjects: (userId: string) => Promise<ApiResponse<Project[]>>;
      updateProject: (data: {
        projectId: string;
        input: Partial<CreateProjectInput>;
        userId: string;
      }) => Promise<ApiResponse<Project>>;
      archiveProject: (data: {
        projectId: string;
        userId: string;
      }) => Promise<ApiResponse<void>>;
      deleteProject: (data: {
        projectId: string;
        userId: string;
      }) => Promise<ApiResponse<void>>;
      addAgentToProject: (data: {
        projectId: string;
        agentId: string;
        role: string;
        userId: string;
      }) => Promise<ApiResponse<void>>;
      removeAgentFromProject: (data: {
        projectId: string;
        agentId: string;
        userId: string;
      }) => Promise<ApiResponse<void>>;

      // Agent methods
      createAgent: (data: CreateAgentInput) => Promise<ApiResponse<Agent>>;
      findAgentById: (agentId: string) => Promise<ApiResponse<Agent | null>>;
      findAgentsByCreator: (creatorId: string) => Promise<ApiResponse<Agent[]>>;
      findProjectAgents: (projectId: string) => Promise<ApiResponse<Agent[]>>;
      getAvailableAgents: (userId: string) => Promise<ApiResponse<Agent[]>>;
      updateAgent: (data: {
        agentId: string;
        input: Partial<CreateAgentInput>;
        userId: string;
      }) => Promise<ApiResponse<Agent>>;
      updateAgentStatus: (data: {
        agentId: string;
        status: string;
      }) => Promise<ApiResponse<void>>;
      deleteAgent: (data: {
        agentId: string;
        userId: string;
      }) => Promise<ApiResponse<void>>;

      // Message methods
      createMessage: (
        data: CreateMessageInput,
      ) => Promise<ApiResponse<Message>>;
      getChannelMessages: (data: {
        channelId: string;
        limit?: number;
        before?: string;
      }) => Promise<ApiResponse<Message[]>>;
      getDMMessages: (data: {
        dmConversationId: string;
        limit?: number;
        before?: string;
      }) => Promise<ApiResponse<Message[]>>;
      findMessageById: (
        messageId: string,
      ) => Promise<ApiResponse<Message | null>>;
      updateMessage: (data: {
        messageId: string;
        content: string;
        authorId: string;
      }) => Promise<ApiResponse<Message>>;
      deleteMessage: (data: {
        messageId: string;
        authorId: string;
      }) => Promise<ApiResponse<void>>;

      // Channel methods (we'll add these later)
      createChannel: (
        data: CreateChannelInput,
      ) => Promise<ApiResponse<Channel>>;
      findChannelById: (
        channelId: string,
      ) => Promise<ApiResponse<Channel | null>>;
      findProjectChannels: (
        projectId: string,
      ) => Promise<ApiResponse<Channel[]>>;
      updateChannel: (data: {
        channelId: string;
        input: Partial<CreateChannelInput>;
        userId: string;
      }) => Promise<ApiResponse<Channel>>;
      deleteChannel: (data: {
        channelId: string;
        userId: string;
      }) => Promise<ApiResponse<void>>;
    };
  }
}

// API Client class for easier usage in React components
export class ApiClient {
  // Auth methods
  static async login(data: LoginInput): Promise<AuthResult> {
    const response = await window.electronAPI.login(data);
    if (!response.success) {
      throw new Error(response.error?.message || "Login failed");
    }
    return response.data!;
  }

  static async register(data: RegisterInput): Promise<AuthResult> {
    const response = await window.electronAPI.register(data);
    if (!response.success) {
      throw new Error(response.error?.message || "Registration failed");
    }
    return response.data!;
  }

  static async validateToken(
    token: string,
  ): Promise<{ userId: string; username: string }> {
    const response = await window.electronAPI.validateToken(token);
    if (!response.success) {
      throw new Error(response.error?.message || "Token validation failed");
    }
    return response.data!;
  }

  static async getCurrentUser(userId: string): Promise<User> {
    const response = await window.electronAPI.getCurrentUser(userId);
    if (!response.success) {
      throw new Error(response.error?.message || "Failed to get current user");
    }
    return response.data!;
  }

  static async logout(userId: string): Promise<void> {
    const response = await window.electronAPI.logout(userId);
    if (!response.success) {
      throw new Error(response.error?.message || "Logout failed");
    }
  }

  static async changePassword(data: {
    userId: string;
    currentPassword: string;
    newPassword: string;
  }): Promise<void> {
    const response = await window.electronAPI.changePassword(data);
    if (!response.success) {
      throw new Error(response.error?.message || "Password change failed");
    }
  }

  // Project methods
  static async createProject(data: CreateProjectInput): Promise<Project> {
    const response = await window.electronAPI.createProject(data);
    if (!response.success) {
      throw new Error(response.error?.message || "Failed to create project");
    }
    return response.data!;
  }

  static async findProjectById(projectId: string): Promise<Project | null> {
    const response = await window.electronAPI.findProjectById(projectId);
    if (!response.success) {
      throw new Error(response.error?.message || "Failed to find project");
    }
    return response.data!;
  }

  static async findUserProjects(userId: string): Promise<Project[]> {
    const response = await window.electronAPI.findUserProjects(userId);
    if (!response.success) {
      throw new Error(
        response.error?.message || "Failed to find user projects",
      );
    }
    return response.data!;
  }

  static async updateProject(data: {
    projectId: string;
    input: Partial<CreateProjectInput>;
    userId: string;
  }): Promise<Project> {
    const response = await window.electronAPI.updateProject(data);
    if (!response.success) {
      throw new Error(response.error?.message || "Failed to update project");
    }
    return response.data!;
  }

  static async archiveProject(data: {
    projectId: string;
    userId: string;
  }): Promise<void> {
    const response = await window.electronAPI.archiveProject(data);
    if (!response.success) {
      throw new Error(response.error?.message || "Failed to archive project");
    }
  }

  static async deleteProject(data: {
    projectId: string;
    userId: string;
  }): Promise<void> {
    const response = await window.electronAPI.deleteProject(data);
    if (!response.success) {
      throw new Error(response.error?.message || "Failed to delete project");
    }
  }

  // Agent methods
  static async createAgent(data: CreateAgentInput): Promise<Agent> {
    const response = await window.electronAPI.createAgent(data);
    if (!response.success) {
      throw new Error(response.error?.message || "Failed to create agent");
    }
    return response.data!;
  }

  static async findAgentsByCreator(creatorId: string): Promise<Agent[]> {
    const response = await window.electronAPI.findAgentsByCreator(creatorId);
    if (!response.success) {
      throw new Error(response.error?.message || "Failed to find agents");
    }
    return response.data!;
  }

  static async findProjectAgents(projectId: string): Promise<Agent[]> {
    const response = await window.electronAPI.findProjectAgents(projectId);
    if (!response.success) {
      throw new Error(
        response.error?.message || "Failed to find project agents",
      );
    }
    return response.data!;
  }

  static async getAvailableAgents(userId: string): Promise<Agent[]> {
    const response = await window.electronAPI.getAvailableAgents(userId);
    if (!response.success) {
      throw new Error(
        response.error?.message || "Failed to get available agents",
      );
    }
    return response.data!;
  }

  static async updateAgent(data: {
    agentId: string;
    input: Partial<CreateAgentInput>;
    userId: string;
  }): Promise<Agent> {
    const response = await window.electronAPI.updateAgent(data);
    if (!response.success) {
      throw new Error(response.error?.message || "Failed to update agent");
    }
    return response.data!;
  }

  static async deleteAgent(data: {
    agentId: string;
    userId: string;
  }): Promise<void> {
    const response = await window.electronAPI.deleteAgent(data);
    if (!response.success) {
      throw new Error(response.error?.message || "Failed to delete agent");
    }
  }

  // Message methods
  static async createMessage(data: CreateMessageInput): Promise<Message> {
    const response = await window.electronAPI.createMessage(data);
    if (!response.success) {
      throw new Error(response.error?.message || "Failed to create message");
    }
    return response.data!;
  }

  static async getChannelMessages(data: {
    channelId: string;
    limit?: number;
    before?: string;
  }): Promise<Message[]> {
    const response = await window.electronAPI.getChannelMessages(data);
    if (!response.success) {
      throw new Error(
        response.error?.message || "Failed to get channel messages",
      );
    }
    return response.data!;
  }

  static async getDMMessages(data: {
    dmConversationId: string;
    limit?: number;
    before?: string;
  }): Promise<Message[]> {
    const response = await window.electronAPI.getDMMessages(data);
    if (!response.success) {
      throw new Error(response.error?.message || "Failed to get DM messages");
    }
    return response.data!;
  }

  static async updateMessage(data: {
    messageId: string;
    content: string;
    authorId: string;
  }): Promise<Message> {
    const response = await window.electronAPI.updateMessage(data);
    if (!response.success) {
      throw new Error(response.error?.message || "Failed to update message");
    }
    return response.data!;
  }

  static async deleteMessage(data: {
    messageId: string;
    authorId: string;
  }): Promise<void> {
    const response = await window.electronAPI.deleteMessage(data);
    if (!response.success) {
      throw new Error(response.error?.message || "Failed to delete message");
    }
  }
}
