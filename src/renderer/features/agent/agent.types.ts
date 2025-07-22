// Re-export types from backend
import type {
  SelectAgent as BackendSelectAgent,
  CreateAgentInput as BackendCreateAgentInput,
  AgentStatus as BackendAgentStatus,
  ModelConfig as BackendModelConfig,
  AgentWithProvider as BackendAgentWithProvider,
} from "@/main/features/agent/agent.types";

export type SelectAgent = BackendSelectAgent;
export type CreateAgentInput = BackendCreateAgentInput;
export type AgentStatus = BackendAgentStatus;
export type ModelConfig = BackendModelConfig;
export type AgentWithProvider = BackendAgentWithProvider;

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
