// src_refactored/shared/types/entities.ts

// --- Project Types ---
export interface Project {
  id: string;
  name: string;
  description: string; // Tornando obrigatório para consistência, pode ser string vazia
  lastActivity: string; // Idealmente seria Date, mas string para simplicidade IPC inicial
  status: 'active' | 'paused' | 'planning' | 'completed' | 'archived';
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
  personaTemplateName?: string; // Denormalized for display convenience
  llmProviderConfigId: string;
  llmConfigName?: string; // Denormalized for display convenience
  temperature: number;
  status: 'idle' | 'running' | 'paused' | 'error' | 'completed';
  currentJobId?: string | null;
  lastActivity?: string; // Idealmente Date
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
  providerId: string; // e.g., 'openai', 'deepseek', 'ollama'
  baseUrl?: string;
  apiKey?: string; // Importante: gerenciar com segurança, não expor desnecessariamente
}

export interface LLMConfigFormData {
  name: string;
  providerId: 'openai' | 'deepseek' | 'ollama' | string; // string for extensibility
  apiKey?: string;
  baseUrl?: string;
}

// --- Chat & DM Types ---
export interface ChatMessageSender {
  id: string; // userId or agentId
  name: string;
  type: 'user' | 'agent';
  avatarUrl?: string;
}

export interface ChatMessage {
  id: string;
  sender: ChatMessageSender;
  content: string;
  timestamp: string | Date; // string for display, Date for manipulation
  type?: 'text' | 'tool_call' | 'tool_response' | 'error' | 'system';
  isContinuation?: boolean;
}

export interface DirectMessageItem { // For UserSidebar DM list
  id: string; // conversationId (could be with a user or an agent)
  name: string; // Name of the other user or agent
  avatarUrl?: string;
  lastMessage?: string;
  timestamp?: string;
  unreadCount?: number;
  type: 'user' | 'agent'; // Type of the other participant
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
  avatarUrl?: string; // Path or new URL
}

export type Theme = 'light' | 'dark' | 'system';

export interface AppSettings {
  theme: Theme;
}
