import type { SelectProject, InsertProject } from "@/main/features/project/project.model";

// Base derived types
export type UpdateProject = Partial<InsertProject> & { id: string };

// Project creation input (for frontend forms)
export type CreateProjectInput = Omit<InsertProject, "id" | "createdAt" | "updatedAt">;

// Project update input (for frontend forms)
export type UpdateProjectInput = Partial<CreateProjectInput>;

// Project without timestamps (for API responses where timestamps aren't needed)
export type ProjectSummary = Omit<SelectProject, "createdAt" | "updatedAt">;

// Project with required fields only (minimal project info)
export type MinimalProject = Pick<SelectProject, "id" | "name" | "status">;

// Project filtering and search types
export interface ProjectFilters {
  status?: SelectProject["status"];
  search?: string;
  hasGitUrl?: boolean;
  hasLocalPath?: boolean;
}

// Project statistics
export interface ProjectStats {
  totalProjects: number;
  activeProjects: number;
  archivedProjects: number;
  projectsWithGit: number;
}

// Project operation results
export interface ProjectCreationResult {
  project: SelectProject;
  success: boolean;
  message?: string;
}

export interface ProjectUpdateResult {
  project: SelectProject;
  success: boolean;
  message?: string;
}

export interface ProjectDeletionResult {
  success: boolean;
  message?: string;
}