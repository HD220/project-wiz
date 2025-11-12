import { invoke, Channel } from '@tauri-apps/api/core';
import type {
  User,
  Agent,
  LlmProvider,
  Project,
  Conversation,
  Message,
  RegisterInput,
  LoginInput,
  CreateAgentInput,
  UpdateAgentInput,
  CreateProviderInput,
  UpdateProviderInput,
  UpdateProviderApiKeyInput,
  CreateProjectInput,
  UpdateProjectInput,
  CreateConversationInput,
  UpdateConversationInput,
  ParticipantInput,
  CreateMessageInput,
  UpdateMessageInput,
  ListMessagesInput,
  SearchMessagesInput,
  AppError,
} from './types';

// ============================================================================
// Helper Functions
// ============================================================================

class TauriError extends Error {
  kind: string;

  constructor(message: string, kind: string) {
    super(message);
    this.name = 'TauriError';
    this.kind = kind;
  }
}

async function invokeCommand<T>(
  command: string,
  args?: Record<string, unknown>
): Promise<T> {
  try {
    return await invoke<T>(command, args);
  } catch (error) {
    if (typeof error === 'object' && error !== null && 'message' in error && 'kind' in error) {
      const appError = error as AppError;
      throw new TauriError(appError.message, appError.kind);
    }
    throw new Error('Unknown error occurred');
  }
}

// ============================================================================
// Auth API
// ============================================================================

export const authApi = {
  register: (input: RegisterInput) =>
    invokeCommand<{ user: User; token: string }>('register', { input }),

  login: (input: LoginInput) =>
    invokeCommand<{ user: User; token: string }>('login', {
      email: input.email,
      password: input.password
    }),

  getCurrentUser: (token: string) =>
    invokeCommand<User>('get_current_user', { token }),

  logout: (token: string) =>
    invokeCommand<void>('logout', { token }),
};

// ============================================================================
// Agents API
// ============================================================================

export const agentsApi = {
  create: (input: CreateAgentInput, token: string) =>
    invokeCommand<Agent>('create_agent', { input, token }),

  list: (token: string) =>
    invokeCommand<Agent[]>('list_agents', { token }),

  get: (id: string, token: string) =>
    invokeCommand<Agent>('get_agent', { id, token }),

  update: (input: UpdateAgentInput, token: string) =>
    invokeCommand<Agent>('update_agent', { input, token }),

  delete: (id: string, token: string) =>
    invokeCommand<void>('delete_agent', { id, token }),
};

// ============================================================================
// Providers API
// ============================================================================

export const providersApi = {
  create: (input: CreateProviderInput, token: string) =>
    invokeCommand<LlmProvider>('create_provider', { input, token }),

  list: (token: string) =>
    invokeCommand<LlmProvider[]>('list_providers', { token }),

  get: (id: string, token: string) =>
    invokeCommand<LlmProvider>('get_provider', { id, token }),

  update: (input: UpdateProviderInput, token: string) =>
    invokeCommand<LlmProvider>('update_provider', { input, token }),

  updateApiKey: (input: UpdateProviderApiKeyInput, token: string) =>
    invokeCommand<LlmProvider>('update_provider_api_key', { input, token }),

  delete: (id: string, token: string) =>
    invokeCommand<void>('delete_provider', { id, token }),
};

// ============================================================================
// Projects API
// ============================================================================

export const projectsApi = {
  create: (input: CreateProjectInput, token: string) =>
    invokeCommand<Project>('create_project', { input, token }),

  list: (token: string) =>
    invokeCommand<Project[]>('list_projects', { token }),

  get: (id: string, token: string) =>
    invokeCommand<Project>('get_project', { id, token }),

  update: (input: UpdateProjectInput, token: string) =>
    invokeCommand<Project>('update_project', { input, token }),

  archive: (id: string, token: string) =>
    invokeCommand<Project>('archive_project', { id, token }),

  unarchive: (id: string, token: string) =>
    invokeCommand<Project>('unarchive_project', { id, token }),

  delete: (id: string, token: string) =>
    invokeCommand<void>('delete_project', { id, token }),
};

// ============================================================================
// Conversations API
// ============================================================================

export const conversationsApi = {
  create: (input: CreateConversationInput, token: string) =>
    invokeCommand<Conversation>('create_conversation', { input, token }),

  list: (token: string) =>
    invokeCommand<Conversation[]>('list_conversations', { token }),

  get: (id: string, token: string) =>
    invokeCommand<Conversation>('get_conversation', { id, token }),

  update: (input: UpdateConversationInput, token: string) =>
    invokeCommand<Conversation>('update_conversation', { input, token }),

  archive: (id: string, token: string) =>
    invokeCommand<Conversation>('archive_conversation', { id, token }),

  delete: (id: string, token: string) =>
    invokeCommand<void>('delete_conversation', { id, token }),

  addParticipant: (input: ParticipantInput, token: string) =>
    invokeCommand<void>('add_participant', { input, token }),

  removeParticipant: (input: ParticipantInput, token: string) =>
    invokeCommand<void>('remove_participant', { input, token }),
};

// ============================================================================
// Messages API
// ============================================================================

export const messagesApi = {
  create: (input: CreateMessageInput, token: string) =>
    invokeCommand<Message>('create_message', { input, token }),

  list: (input: ListMessagesInput, token: string) =>
    invokeCommand<Message[]>('list_messages', { input, token }),

  get: (id: string, token: string) =>
    invokeCommand<Message>('get_message', { id, token }),

  update: (input: UpdateMessageInput, token: string) =>
    invokeCommand<Message>('update_message', { input, token }),

  delete: (id: string, token: string) =>
    invokeCommand<void>('delete_message', { id, token }),

  search: (input: SearchMessagesInput, token: string) =>
    invokeCommand<Message[]>('search_messages', { input, token }),

  getHistory: (conversation_id: string, last_n: number, token: string) =>
    invokeCommand<Message[]>('get_message_history', {
      conversation_id,
      last_n,
      token,
    }),

  sendStreaming: async (
    conversation_id: string,
    content: string,
    agent_id: string,
    token: string,
    onChunk: (chunk: string) => void
  ): Promise<Message> => {
    const channel = new Channel<string>();
    channel.onmessage = onChunk;

    return invokeCommand<Message>('send_message_streaming', {
      conversation_id,
      content,
      agent_id,
      token,
      on_chunk: channel,
    });
  },
};

// ============================================================================
// Export all APIs
// ============================================================================

export const api = {
  auth: authApi,
  agents: agentsApi,
  providers: providersApi,
  projects: projectsApi,
  conversations: conversationsApi,
  messages: messagesApi,
};

export { TauriError };
