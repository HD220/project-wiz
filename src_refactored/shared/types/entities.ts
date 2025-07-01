// --- Project Types ---
export interface Project {
  id: string;
  name: string;
  description: string;
  lastActivity: string;
  status: "active" | "paused" | "planning" | "completed" | "archived";
  agentCount: number;
  taskCount: number;
  // imageUrl?: string;
}

export interface ProjectFormData {
  name: string;
  description?: string;
}

// --- Persona Template Types ---
export interface PersonaTemplate {
  id: string;
  name: string;
  role: string;
  goal: string;
  backstory?: string;
  toolNames?: string[];
}

export interface PersonaTemplateFormData {
  name: string;
  role: string;
  goal: string;
  backstory?: string;
  toolNames?: string[];
}

// --- Agent Instance Types ---
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
}

export interface AgentInstanceFormData {
  agentName?: string;
  personaTemplateId: string;
  llmProviderConfigId: string;
  temperature: number;
}

// --- LLMConfig Types ---
export interface LLMConfig {
  id: string;
  name: string;
  providerId: string;
  baseUrl?: string;
  apiKey?: string;
}

export interface LLMConfigFormData {
  name: string;
  providerId: "openai" | "deepseek" | "ollama" | string;
  apiKey?: string;
  baseUrl?: string;
}

// --- Chat & DM Types ---
export interface ChatMessageSender {
  id: string;
  name: string;
  type: "user" | "agent";
  avatarUrl?: string;
}

export interface ChatMessage {
  id: string;
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
