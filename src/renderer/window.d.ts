import type { AgentFiltersInput } from "@/main/features/agent/agent.schema";
import type {
  CreateAgentInput,
  AgentStatus,
  SelectAgent,
  AgentWithProvider,
} from "@/main/features/agent/agent.types";
import type {
  CreateProviderInput,
  LlmProvider,
} from "@/renderer/features/agent/provider.types";
import type { ProviderFiltersInput } from "@/renderer/features/agent/provider.schema";
import type { CreateDMConversationInput } from "@/main/features/dm/dm-conversation.types";
import type { CreateProjectChannelInput } from "@/main/features/project/project-channel.types";
import type {
  LoginCredentials,
  RegisterUserInput,
  AuthResult,
  AuthenticatedUser,
} from "@/main/features/auth/auth.types";
import type {
  InsertProject,
  UpdateProject,
  SelectProject,
} from "@/main/features/project/project.types";
import type { UserSummary } from "@/main/features/user/user.service";
import type { Theme } from "@/main/features/user/user.types";
import type { IpcResponse } from "@/main/types";

import type {
  CreateConversationInput,
  SendMessageInput,
  SelectMessage,
  ConversationWithLastMessage,
  ConversationWithParticipants,
} from "@/renderer/features/conversation/types";

declare global {
  interface Window {
    api: {
      // System information
      platform: string;
      version: string;

      // Authentication API (Desktop - session managed by main process)
      auth: {
        register: (
          input: RegisterUserInput,
        ) => Promise<IpcResponse<AuthResult>>;
        login: (
          credentials: LoginCredentials,
        ) => Promise<IpcResponse<AuthResult>>;
        getCurrentUser: () => Promise<IpcResponse<AuthenticatedUser>>;
        getActiveSession: () => Promise<
          IpcResponse<{ user: AuthenticatedUser }>
        >;
        logout: () => Promise<IpcResponse<void>>;
        isLoggedIn: () => Promise<IpcResponse<{ isLoggedIn: boolean }>>;
        getUserById: (
          userId: string,
        ) => Promise<IpcResponse<AuthenticatedUser>>;
      };

      // Profile API
      profile: {
        getTheme: (userId: string) => Promise<IpcResponse<{ theme: Theme }>>;
        updateTheme: (
          userId: string,
          theme: Theme,
        ) => Promise<IpcResponse<{ theme: Theme }>>;
      };

      // Users API
      users: {
        listAvailableUsers: () => Promise<IpcResponse<UserSummary[]>>;
      };

      // Projects API
      projects: {
        create: (input: InsertProject) => Promise<IpcResponse<SelectProject>>;
        findById: (id: string) => Promise<IpcResponse<SelectProject | null>>;
        listAll: () => Promise<IpcResponse<SelectProject[]>>;
        update: (input: UpdateProject) => Promise<IpcResponse<SelectProject>>;
        archive: (id: string) => Promise<IpcResponse<SelectProject>>;
      };

      // DM Conversations API
      dm: {
        create: (input: CreateDMConversationInput) => Promise<IpcResponse>;
        getUserConversations: (options?: {
          includeInactive?: boolean;
          includeArchived?: boolean;
        }) => Promise<IpcResponse>;
        findById: (dmId: string) => Promise<IpcResponse>;
        archive: (dmId: string) => Promise<IpcResponse>;
        unarchive: (dmId: string) => Promise<IpcResponse>;
        sendMessage: (dmId: string, content: string) => Promise<IpcResponse>;
        getMessages: (dmId: string) => Promise<IpcResponse>;
        addParticipant: (
          dmId: string,
          participantId: string,
        ) => Promise<IpcResponse>;
        removeParticipant: (
          dmId: string,
          participantId: string,
        ) => Promise<IpcResponse>;
        delete: (dmId: string) => Promise<IpcResponse>;
      };

      // Project Channels API
      channels: {
        create: (input: CreateProjectChannelInput) => Promise<IpcResponse>;
        getProjectChannels: (
          projectId: string,
          options?: {
            includeInactive?: boolean;
            includeArchived?: boolean;
          },
        ) => Promise<IpcResponse>;
        findById: (channelId: string) => Promise<IpcResponse>;
        update: (
          channelId: string,
          updates: { name?: string; description?: string },
        ) => Promise<IpcResponse>;
        archive: (channelId: string) => Promise<IpcResponse>;
        unarchive: (channelId: string) => Promise<IpcResponse>;
        sendMessage: (
          channelId: string,
          content: string,
        ) => Promise<IpcResponse>;
        getMessages: (channelId: string) => Promise<IpcResponse>;
        delete: (channelId: string) => Promise<IpcResponse>;
      };

      // LLM Providers API
      llmProviders: {
        create: (
          input: CreateProviderInput,
        ) => Promise<IpcResponse<LlmProvider>>;
        list: (
          filters?: ProviderFiltersInput,
        ) => Promise<IpcResponse<LlmProvider[]>>;
        getById: (id: string) => Promise<IpcResponse<LlmProvider | null>>;
        update: (
          id: string,
          updates: Partial<CreateProviderInput>,
        ) => Promise<IpcResponse<LlmProvider>>;
        delete: (id: string) => Promise<IpcResponse<void>>;
        setDefault: (
          providerId: string,
        ) => Promise<IpcResponse<{ message: string }>>;
        getDefault: () => Promise<IpcResponse<LlmProvider | null>>;
      };

      // Agents API
      agents: {
        create: (input: CreateAgentInput) => Promise<IpcResponse<SelectAgent>>;
        list: (
          filters?: AgentFiltersInput,
        ) => Promise<IpcResponse<SelectAgent[]>>;
        get: (id: string) => Promise<IpcResponse<SelectAgent | null>>;
        getWithProvider: (
          id: string,
        ) => Promise<IpcResponse<AgentWithProvider | null>>;
        updateStatus: (
          id: string,
          status: AgentStatus,
        ) => Promise<IpcResponse<{ message: string }>>;
        update: (
          id: string,
          updates: Partial<CreateAgentInput>,
        ) => Promise<IpcResponse<SelectAgent>>;
        delete: (id: string) => Promise<IpcResponse<{ message: string }>>;
        restore: (id: string) => Promise<IpcResponse<SelectAgent>>;
      };

      // General invoke method
      invoke: (channel: string, ...args: unknown[]) => Promise<IpcResponse>;
    };

    electronAPI?: {
      window: {
        minimize: () => Promise<void>;
        maximize: () => Promise<void>;
        toggleMaximize: () => Promise<void>;
        close: () => Promise<void>;
      };
    };
  }
}

export {};
