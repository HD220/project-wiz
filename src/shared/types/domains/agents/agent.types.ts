export interface AgentDto {
  id: string;
  name: string;
  role: string;
  goal: string;
  backstory: string;
  llmProviderId: string;
  temperature: number;
  maxTokens: number;
  isActive: boolean;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
  status: string;
  isExecuting: boolean;
  currentTask?: string;
  avatar?: string;
}

export interface CreateAgentDto {
  name: string;
  role: string;
  goal: string;
  backstory: string;
  llmProviderId: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  isActive?: boolean;
  isDefault?: boolean;
  verbose?: boolean;
  allowDelegation?: boolean;
  maxIterations?: number;
}

export interface UpdateAgentDto {
  name?: string;
  role?: string;
  goal?: string;
  backstory?: string;
  llmProviderId?: string;
  temperature?: number;
  maxTokens?: number;
  isActive?: boolean;
  isDefault?: boolean;
}

export interface AgentFilterDto {
  name?: string;
  role?: string;
  llmProviderId?: string;
  isActive?: boolean;
}
