// Types related to Project domain entities
import type { ProjectStatus } from "./domain"; // Ensure this path is correct

export interface ProjectType {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  lastUpdate: string; // Consider using Date object or ISO string consistently
  // Add any other project-specific fields that would come from the backend
  // For example:
  // createdAt?: string;
  // ownerId?: string;
  // tags?: string[];
}
