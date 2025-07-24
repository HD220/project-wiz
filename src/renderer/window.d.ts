import type {
  CreateAgentInput,
  AgentStatus,
  SelectAgent,
  AgentWithProvider,
} from "@/main/features/agent/agent.types";
import type {
  CreateProviderInput,
  LlmProvider,
} from "@/main/features/agent/llm-provider/llm-provider.types";
import type {
  MemoryCreationInput,
  MemoryUpdateInput,
  MemorySearchInput,
} from "@/main/features/agent/memory/memory.types";
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

      // Conversations API
      conversations: {
        create: (
          input: CreateConversationInput,
        ) => Promise<IpcResponse<ConversationWithParticipants>>;
        getUserConversations: () => Promise<
          IpcResponse<ConversationWithLastMessage[]>
        >;
      };

      // Messages API
      messages: {
        send: (input: SendMessageInput) => Promise<IpcResponse<SelectMessage>>;
        getConversationMessages: (
          conversationId: string,
        ) => Promise<IpcResponse<SelectMessage[]>>;
      };

      // LLM Providers API
      llmProviders: {
        create: (
          input: CreateProviderInput,
        ) => Promise<IpcResponse<LlmProvider>>;
        list: (userId: string) => Promise<IpcResponse<LlmProvider[]>>;
        getById: (id: string) => Promise<IpcResponse<LlmProvider | null>>;
        update: (
          id: string,
          updates: Partial<CreateProviderInput>,
        ) => Promise<IpcResponse<LlmProvider>>;
        delete: (id: string) => Promise<IpcResponse<void>>;
        setDefault: (
          providerId: string,
          userId: string,
        ) => Promise<IpcResponse<LlmProvider>>;
        getDefault: (
          userId: string,
        ) => Promise<IpcResponse<LlmProvider | null>>;
      };

      // Agents API
      agents: {
        create: (input: CreateAgentInput) => Promise<IpcResponse<SelectAgent>>;
        list: () => Promise<IpcResponse<SelectAgent[]>>;
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
      };

      // Agent Memory API
      agentMemory: {
        create: (input: MemoryCreationInput) => Promise<IpcResponse>;
        findById: (id: string) => Promise<IpcResponse>;
        search: (criteria: MemorySearchInput) => Promise<IpcResponse>;
        getRecent: (
          agentId: string,
          userId: string,
          limit?: number,
        ) => Promise<IpcResponse>;
        getByConversation: (
          conversationId: string,
          limit?: number,
        ) => Promise<IpcResponse>;
        update: (
          id: string,
          updates: MemoryUpdateInput,
        ) => Promise<IpcResponse>;
        archive: (id: string) => Promise<IpcResponse>;
        delete: (id: string) => Promise<IpcResponse>;
        createRelation: (
          sourceMemoryId: string,
          targetMemoryId: string,
          relationType: string,
          strength?: number,
        ) => Promise<IpcResponse>;
        getRelated: (memoryId: string) => Promise<IpcResponse>;
        prune: (
          agentId: string,
          daysOld?: number,
          minImportanceScore?: number,
        ) => Promise<IpcResponse>;
        performMaintenance: (
          agentId: string,
          config?: Record<string, unknown>,
        ) => Promise<IpcResponse>;
        getStatistics: (agentId: string) => Promise<IpcResponse>;
        runAutomatedMaintenance: (
          config?: Record<string, unknown>,
        ) => Promise<IpcResponse>;
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
