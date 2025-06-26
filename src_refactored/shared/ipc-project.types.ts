// src_refactored/shared/ipc-project.types.ts

// This interface defines the data structure for a project item
// when listed, typically returned by IPC calls like 'project:list'.
// It should contain enough information to display in a ProjectCard or similar list item.
export interface ProjectListItem {
  id: string;
  name: string;
  description?: string; // Optional, as cards might show it but list might not always need full desc
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  // Add any other fields that are relevant for a list view,
  // e.g., number of tasks, owner, quick stats, etc.
  // These should ideally align with the output of a ListProjectsUseCase.
  // For now, keeping it aligned with typical Project entity fields.
  ownerName?: string; // Example if owner info is denormalized for lists
  thumbnailUrl?: string; // Optional thumbnail or icon for the project
}

// If the project list query supports pagination or filtering,
// those request payload types would also be defined here.
// For now, assuming a simple parameter-less query for all projects.

export type ProjectListResponse = ProjectListItem[];
