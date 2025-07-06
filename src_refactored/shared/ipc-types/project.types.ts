import { LLMConfig } from "./llm.types";

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

// Request/Response types for Project-related IPC calls

export type GetProjectsListRequest = void;
export type GetProjectsListResponse = Project[];

export type GetProjectDetailsRequest = { projectId: string };
export type GetProjectDetailsResponse = Project | null;

export type CreateProjectRequest = ProjectCreationProps;
export type CreateProjectResponse = Project;

export type UpdateProjectRequest = {
  projectId: string;
  data: ProjectUpdateProps;
};
export type UpdateProjectResponse = Project;

export type DeleteProjectRequest = { projectId: string };
export type DeleteProjectResponse = { success: boolean };

// Event payloads
export type ProjectsUpdatedEventPayload = Project[];
