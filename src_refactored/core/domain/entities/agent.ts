

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

import { LLMConfig } from "./llm"; // Import LLMConfig from its new location