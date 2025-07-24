/**
 * Agent types for renderer process
 */

export type AgentStatus = "active" | "inactive" | "busy";

export interface ModelConfig {
  model: string;
  temperature: number;
  maxTokens: number;
  topP?: number;
}

export interface SelectAgent {
  id: string;
  userId: string;
  name: string;
  role: string;
  backstory: string;
  goal: string;
  providerId: string;
  modelConfig: string; // JSON string
  status: AgentStatus;
  systemPrompt: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateAgentInput {
  name: string;
  role: string;
  backstory: string;
  goal: string;
  providerId: string;
  modelConfig: string;
  status?: AgentStatus;
  avatar?: string;
}

export interface AgentWithProvider extends SelectAgent {
  provider: {
    id: string;
    name: string;
    type: string;
  };
}

// Extended agent type with avatar from user table
export interface AgentWithAvatar extends SelectAgent {
  avatar?: string;
}

// Additional frontend-specific types
export interface AgentFormData {
  name: string;
  role: string;
  backstory: string;
  goal: string;
  providerId: string;
  modelConfig: ModelConfig;
  status: AgentStatus;
  avatar?: string;
}

export interface AgentListItem {
  id: string;
  name: string;
  role: string;
  status: AgentStatus;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AgentFilters {
  status?: AgentStatus;
  search?: string;
}
