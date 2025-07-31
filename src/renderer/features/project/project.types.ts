/**
 * Project types for renderer process
 */

export type ProjectStatus = "active" | "archived";

export interface SelectProject {
  id: string;
  userId?: string;
  ownerId?: string;
  name: string;
  path?: string;
  localPath?: string;
  repositoryUrl?: string | null;
  gitUrl?: string | null;
  branch?: string | null;
  description?: string | null;
  avatarUrl?: string | null;
  status: ProjectStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProjectInput {
  name: string;
  path: string;
  repositoryUrl?: string;
  description?: string;
  status?: ProjectStatus;
}

export interface UpdateProjectInput {
  id: string;
  name?: string;
  path?: string;
  repositoryUrl?: string;
  description?: string;
  status?: ProjectStatus;
}

export type InsertProject = CreateProjectInput;
export type UpdateProject = UpdateProjectInput;
