// Project types for frontend - focused on UI concerns

// Import types first
import type {
  SelectProject,
  InsertProject,
  UpdateProject,
  CreateProjectInput,
  UpdateProjectInput,
  ProjectSummary,
  MinimalProject,
  ProjectFilters,
  ProjectStats,
  ProjectCreationResult,
  ProjectUpdateResult,
  ProjectDeletionResult,
} from "@/main/features/project/project.types";

// Re-export backend types for consistency
export type {
  SelectProject,
  InsertProject,
  UpdateProject,
  CreateProjectInput,
  UpdateProjectInput,
  ProjectSummary,
  MinimalProject,
  ProjectFilters,
  ProjectStats,
  ProjectCreationResult,
  ProjectUpdateResult,
  ProjectDeletionResult,
};

// Frontend-specific types for project UI

export type ProjectStatus = "active" | "archived";

export interface ProjectCardProps {
  project: SelectProject;
  isSelected?: boolean;
  onClick?: (project: SelectProject) => void;
  onArchive?: (projectId: string) => void;
  className?: string;
}

export interface ProjectListProps {
  projects: SelectProject[];
  selectedProjectId?: string;
  onSelectProject?: (project: SelectProject) => void;
  onCreateProject?: () => void;
  showFilters?: boolean;
  className?: string;
}

export interface ProjectFilterProps {
  filters: ProjectFilters;
  onFiltersChange: (filters: Partial<ProjectFilters>) => void;
  className?: string;
}

// Form types for project creation/editing
export interface ProjectFormData {
  name: string;
  description?: string;
  gitUrl?: string;
  localPath?: string;
  status: ProjectStatus;
}

export interface CreateProjectFormData extends Omit<ProjectFormData, "status"> {
  // Creation form doesn't need status (defaults to active)
}

export interface EditProjectFormData extends ProjectFormData {
  id: string; // Required for editing
}

// UI state types
export interface ProjectUIState {
  isCreateDialogOpen: boolean;
  isEditDialogOpen: boolean;
  isDeleteDialogOpen: boolean;
  selectedProjectForEdit?: SelectProject;
  selectedProjectForDelete?: SelectProject;
}

// Project sidebar types
export interface ProjectSidebarProps {
  currentProjectId?: string;
  onProjectSelect?: (projectId: string) => void;
  className?: string;
}

// Project header types
export interface ProjectHeaderProps {
  project?: SelectProject;
  onEdit?: () => void;
  onArchive?: () => void;
  className?: string;
}

// Project statistics for dashboard
export interface ProjectStatistics extends ProjectStats {
  recentProjects: SelectProject[];
  favoriteProjects?: SelectProject[];
}

