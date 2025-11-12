// ============================================================================
// Shared Types (matching Rust backend models)
// ============================================================================

export type User = {
  id: string;
  email: string | null;
  password_hash: string | null;
  name: string;
  avatar_url: string | null;
  user_type: 'human' | 'agent';
  status: 'online' | 'away' | 'busy' | 'offline';
  created_at: number;
  updated_at: number;
  deleted_at: number | null;
};

export type AgentConfig = {
  user_id: string;
  llm_provider_id: string;
  role: string;
  backstory: string;
  goal: string;
  model: string;
  temperature: number;
  max_tokens: number;
  top_p: number | null;
};

export type Agent = {
  user: User;
  config: AgentConfig;
};

export type LlmProvider = {
  id: string;
  owner_id: string;
  name: string;
  provider_type: 'openai' | 'anthropic' | 'google' | 'deepseek' | 'custom';
  base_url: string | null;
  is_default: number; // SQLite boolean (0 or 1)
  created_at: number;
  deleted_at: number | null;
};

export type Project = {
  id: string;
  owner_id: string;
  name: string;
  description: string | null;
  avatar_url: string | null;
  git_url: string | null;
  git_branch: string | null;
  local_path: string;
  created_at: number;
  updated_at: number;
  archived_at: number | null;
  deleted_at: number | null;
};

export type Conversation = {
  id: string;
  owner_id: string;
  project_id: string | null;
  conversation_type: 'channel' | 'dm';
  name: string | null;
  description: string | null;
  created_at: number;
  archived_at: number | null;
  deleted_at: number | null;
};

export type Message = {
  id: string;
  conversation_id: string;
  author_id: string;
  content: string;
  metadata: string | null; // JSON string
  created_at: number;
  edited_at: number | null;
  deleted_at: number | null;
};

// ============================================================================
// API Input Types
// ============================================================================

export type RegisterInput = {
  email: string;
  password: string;
  name: string;
};

export type LoginInput = {
  email: string;
  password: string;
};

export type CreateAgentInput = {
  name: string;
  role: string;
  backstory: string;
  goal: string;
  llm_provider_id: string;
  model: string;
  temperature: number;
  max_tokens: number;
  top_p?: number;
};

export type UpdateAgentInput = {
  id: string;
  name?: string;
  role?: string;
  backstory?: string;
  goal?: string;
  llm_provider_id?: string;
  model?: string;
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
};

export type CreateProviderInput = {
  name: string;
  provider_type: 'openai' | 'anthropic' | 'google' | 'deepseek' | 'custom';
  api_key: string;
  base_url?: string;
  is_default: boolean;
};

export type UpdateProviderInput = {
  id: string;
  name?: string;
  base_url?: string;
  is_default?: boolean;
};

export type UpdateProviderApiKeyInput = {
  id: string;
  api_key: string;
};

export type CreateProjectInput = {
  name: string;
  description?: string;
  avatar_url?: string;
  git_url?: string;
  git_branch?: string;
  local_path: string;
};

export type UpdateProjectInput = {
  id: string;
  name?: string;
  description?: string;
  avatar_url?: string;
  git_url?: string;
  git_branch?: string;
  local_path?: string;
};

export type CreateConversationInput = {
  project_id?: string;
  conversation_type: 'channel' | 'dm';
  name?: string;
  description?: string;
};

export type UpdateConversationInput = {
  id: string;
  name?: string;
  description?: string;
};

export type ParticipantInput = {
  conversation_id: string;
  user_id: string;
};

export type CreateMessageInput = {
  conversation_id: string;
  content: string;
  metadata?: string;
};

export type UpdateMessageInput = {
  id: string;
  content: string;
};

export type ListMessagesInput = {
  conversation_id: string;
  limit?: number;
  offset?: number;
};

export type SearchMessagesInput = {
  conversation_id: string;
  search_term: string;
  limit?: number;
};

// ============================================================================
// Error Types
// ============================================================================

export type AppError = {
  message: string;
  kind: 'database' | 'unauthorized' | 'not_found' | 'validation' | 'llm_provider' | 'encryption';
};
