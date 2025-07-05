export interface Project {
  id: string;
  name: string;
  description: string;
  lastActivity: string;
  status: "active" | "paused" | "planning" | "completed" | "archived";
  agentCount: number;
  taskCount: number;
  platformUrl?: string;
  repositoryUrl?: string;
  tags?: string[];
  llmConfig?: LLMConfig;
}

export interface ProjectFormData {
  name: string;
  description?: string;
  platformUrl?: string;
  repositoryUrl?: string;
  tags?: string[];
  llmConfig?: LLMConfig;
}

// --- Persona Template Types ---
export interface PersonaTemplate {
  id: string;
  name: string;
  role: string;
  goal: string;
  description?: string;
  systemPrompt?: string;
  visionEnabled?: boolean;
  exampleConversations?: Array<{ user: string; agent: string }>;
  backstory?: string;
  toolNames?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface PersonaTemplateFormData {
  id?: string;
  name: string;
  role: string;
  goal: string;
  description?: string;
  systemPrompt?: string;
  visionEnabled?: boolean;
  exampleConversations?: Array<{ user: string; agent: string }>;
  backstory?: string;
  toolNames?: string[];
}

// --- Agent Instance Types ---
export enum AgentLLM {
  OPENAI_GPT_4_TURBO = "openai-gpt-4-turbo",
  OPENAI_GPT_3_5_TURBO = "openai-gpt-3.5-turbo",
  ANTHROPIC_CLAUDE_3_OPUS = "anthropic-claude-3-opus",
  ANTHROPIC_CLAUDE_3_SONNET = "anthropic-claude-3-sonnet",
  GOOGLE_GEMINI_PRO = "google-gemini-pro",
  OLLAMA_LLAMA2 = "ollama-llama2",
}

export interface AgentInstance {
  id: string;
  agentName?: string;
  personaTemplateId: string;
  personaTemplateName?: string;
  llmProviderConfigId: string;
  llmConfigName?: string;
  temperature: number;
  status: "idle" | "running" | "paused" | "error" | "completed";
  currentJobId?: string | null;
  lastActivity?: string;
  projectId?: string;
  llmConfig?: LLMConfig;
  createdAt?: string;
  tools?: string[];
}

export interface AgentInstanceFormData {
  agentName?: string;
  personaTemplateId: string;
  llmProviderConfigId: string;
  temperature: number;
  projectId?: string;
  llmConfig?: LLMConfig;
  tools?: string[];
}

// --- LLMConfig Types ---
export interface LLMConfig {
  id: string;
  name: string;
  providerId: string;
  llm: AgentLLM;
  temperature: number;
  maxTokens: number;
  baseUrl?: string;
  apiKey?: string;
}

export interface LLMConfigFormData {
  name: string;
  providerId: "openai" | "deepseek" | "ollama" | string;
  apiKey?: string;
  baseUrl?: string;
}

export type LLMSettings = Record<AgentLLM, Partial<LLMConfig>>;

// --- Chat & DM Types ---
export interface ChatMessageSender {
  id: string;
  name: string;
  type: "user" | "agent";
  avatarUrl?: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  sender: ChatMessageSender;
  content: string;
  timestamp: string | Date;
  type?: "text" | "tool_call" | "tool_response" | "error" | "system";
  isContinuation?: boolean;
}

export interface DirectMessageItem {
  id: string;
  name: string;
  avatarUrl?: string;
  lastMessage?: string;
  timestamp?: string;
  unreadCount?: number;
  type: "user" | "agent";
  participantIds?: string[];
}

// --- User Profile & Settings Types ---
export interface UserProfile {
  id: string;
  displayName: string;
  email: string;
  avatarUrl?: string;
}

export interface UserProfileFormData {
  displayName: string;
  avatarUrl?: string;
}

export type Theme = "light" | "dark" | "system";

export interface AppSettings {
  theme: Theme;
}
