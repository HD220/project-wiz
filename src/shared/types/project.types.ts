export interface ProjectDto {
  id: string;
  name: string;
  description?: string;
  gitUrl?: string;
  status: "active" | "inactive" | "archived";
  avatar?: string;
  createdAt: string;
  updatedAt: string;
  unreadCount: number;
  lastActivity: string;
}

export interface CreateProjectDto {
  name: string;
  description?: string;
  gitUrl?: string;
  avatar?: string;
  status?: "active" | "inactive" | "archived";
}

export interface UpdateProjectDto {
  id: string;
  name?: string;
  description?: string;
  gitUrl?: string;
  avatar?: string;
  status?: "active" | "inactive" | "archived";
  updatedAt?: Date;
}

export interface ProjectFilterDto {
  status?: "active" | "inactive" | "archived";
  limit?: number;
  offset?: number;
}
