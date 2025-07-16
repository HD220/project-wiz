export interface AgentEventData {
  id: string;
  name: string;
  role: string;
  goal: string;
  backstory: string;
  llmProviderId: string;
}

export interface AgentUpdateData {
  name?: string;
  role?: string;
  goal?: string;
  backstory?: string;
  llmProviderId?: string;
  temperature?: number;
  maxTokens?: number;
  isActive?: boolean;
}
