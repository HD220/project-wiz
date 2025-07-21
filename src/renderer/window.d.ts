import type {
  CreateAgentInput,
  AgentStatus,
} from "@/main/features/agent/agent.types";
import type { CreateProviderInput } from "@/main/features/agent/llm-provider/llm-provider.types";
import type {
  MemoryCreationInput,
  MemoryUpdateInput,
  MemorySearchInput,
} from "@/main/features/agent/memory/memory.types";
import type {
  LoginCredentials,
  RegisterUserInput,
} from "@/main/features/auth/auth.types";
import type { SendAgentMessageInput } from "@/main/features/conversation/agent-chat.service";
import type { CreateConversationInput } from "@/main/features/conversation/conversation.service";
import type { SendMessageInput } from "@/main/features/conversation/message.service";
import type {
  InsertProject,
  UpdateProject,
} from "@/main/features/project/project.model";
import type { Theme } from "@/main/features/user/profile.model";
import type { IpcResponse } from "@/main/types";

declare global {
  interface Window {
    api: {
      // System information
      platform: string;
      version: string;

      // Authentication API
      auth: {
        register: (input: RegisterUserInput) => Promise<IpcResponse>;
        login: (credentials: LoginCredentials) => Promise<IpcResponse>;
        getCurrentUser: () => Promise<IpcResponse>;
        logout: () => Promise<IpcResponse>;
        isLoggedIn: () => Promise<IpcResponse>;
        getUserById: (userId: string) => Promise<IpcResponse>;
      };

      // Profile API
      profile: {
        getTheme: (userId: string) => Promise<IpcResponse>;
        updateTheme: (userId: string, theme: Theme) => Promise<IpcResponse>;
      };

      // Projects API
      projects: {
        create: (input: InsertProject) => Promise<IpcResponse>;
        findById: (id: string) => Promise<IpcResponse>;
        listAll: () => Promise<IpcResponse>;
        update: (input: UpdateProject) => Promise<IpcResponse>;
        archive: (id: string) => Promise<IpcResponse>;
      };

      // Conversations API
      conversations: {
        create: (input: CreateConversationInput) => Promise<IpcResponse>;
        getUserConversations: (userId: string) => Promise<IpcResponse>;
      };

      // Messages API
      messages: {
        send: (input: SendMessageInput) => Promise<IpcResponse>;
        getConversationMessages: (
          conversationId: string,
        ) => Promise<IpcResponse>;
      };

      // LLM Providers API
      llmProviders: {
        create: (input: CreateProviderInput) => Promise<IpcResponse>;
        list: (userId: string) => Promise<IpcResponse>;
        getById: (id: string) => Promise<IpcResponse>;
        update: (
          id: string,
          updates: Partial<CreateProviderInput>,
        ) => Promise<IpcResponse>;
        delete: (id: string) => Promise<IpcResponse>;
        setDefault: (
          providerId: string,
          userId: string,
        ) => Promise<IpcResponse>;
        getDefault: (userId: string) => Promise<IpcResponse>;
        testApiKey: (
          type: "openai" | "deepseek" | "anthropic" | "google" | "custom",
          apiKey: string,
          baseUrl?: string,
        ) => Promise<IpcResponse>;
      };

      // Agents API
      agents: {
        create: (input: CreateAgentInput) => Promise<IpcResponse>;
        list: () => Promise<IpcResponse>;
        get: (id: string) => Promise<IpcResponse>;
        getWithProvider: (id: string) => Promise<IpcResponse>;
        updateStatus: (id: string, status: AgentStatus) => Promise<IpcResponse>;
        update: (
          id: string,
          updates: Partial<CreateAgentInput>,
        ) => Promise<IpcResponse>;
        delete: (id: string) => Promise<IpcResponse>;
      };

      // Agent Chat API
      agentChat: {
        sendMessage: (input: SendAgentMessageInput) => Promise<IpcResponse>;
        getConversation: (
          userId: string,
          agentId: string,
        ) => Promise<IpcResponse>;
        sendMessageWithMemory: (
          input: SendAgentMessageInput,
        ) => Promise<IpcResponse>;
        getConversationWithMemory: (
          userId: string,
          agentId: string,
        ) => Promise<IpcResponse>;
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
