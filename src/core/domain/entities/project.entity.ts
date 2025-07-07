export interface Project {
  id: string;
  name: string;
  description?: string;
  lastActivity: string;
  status: "active" | "paused" | "planning" | "completed" | "archived";
  agentCount: number;
  taskCount: number;
  platformUrl?: string;
  repositoryUrl?: string;
  tags?: string[];
  llmConfig?: LLMConfig;
  createdAt?: string;
  updatedAt?: string;
  projectManager?: string;
  teamMembers?: string[];
  version?: string;
}

export interface ProjectCreationProps {
  name: string;
  description?: string;
  platformUrl?: string;
  repositoryUrl?: string;
  tags?: string[];
  llmConfig?: LLMConfig;
  projectManager?: string;
  teamMembers?: string[];
  version?: string;
}

export interface ProjectUpdateProps {
  name?: string;
  description?: string;
  platformUrl?: string;
  repositoryUrl?: string;
  tags?: string[];
  llmConfig?: LLMConfig;
  projectManager?: string;
  teamMembers?: string[];
  version?: string;
  lastActivity?: string;
  status?: "active" | "paused" | "planning" | "completed" | "archived";
  agentCount?: number;
  taskCount?: number;
}

// Import LLMConfig if it's a domain entity, otherwise define it here or import from shared/types/entities
// For now, assuming LLMConfig is also a domain entity or can be imported from shared.
// If LLMConfig is a simple type, it can be defined directly here.
// For simplicity, let's assume it's a simple type for now or will be defined in shared/types/entities.
// We will import it from shared/types/entities for now.
import { LLMConfig } from "./llm";
