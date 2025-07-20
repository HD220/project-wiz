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
      };
    };
  }
}

export {};
