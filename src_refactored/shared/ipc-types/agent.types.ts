import type { LLMConfig } from "./llm.types";

// DTO for Agent Instance
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

// DTO for Agent Instance Form Data
export interface AgentInstanceFormData {
  agentName?: string;
  personaTemplateId: string;
  llmProviderConfigId: string;
  temperature: number;
  projectId?: string;
  llmConfig?: LLMConfig;
  tools?: string[];
}


// Agent Instances
export type GetAgentInstancesListRequest = void;
export type GetAgentInstancesListResponse = AgentInstance[];

export type GetAgentInstancesByProjectRequest = { projectId: string };
export type GetAgentInstancesByProjectResponse = AgentInstance[];

export type GetAgentInstanceDetailsRequest = { agentId: string };
export type GetAgentInstanceDetailsResponse = AgentInstance | null;

export type CreateAgentInstanceRequest = AgentInstanceFormData;
export type CreateAgentInstanceResponse = AgentInstance;

export type UpdateAgentInstanceRequest = {
  agentId: string;
  data: Partial<AgentInstanceFormData>;
};
export type UpdateAgentInstanceResponse = AgentInstance;

export type DeleteAgentInstanceRequest = { agentId: string };
export type DeleteAgentInstanceResponse = { success: boolean };

export type AgentInstancesUpdatedEventPayload = AgentInstance[];


