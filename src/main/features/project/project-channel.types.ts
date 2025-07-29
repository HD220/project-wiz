import type {
  SelectProjectChannel,
  InsertProjectChannel,
} from "./project-channel.model";
import type { SelectProject } from "./project.model";

// Project Channel derived types
export type UpdateProjectChannel = Partial<InsertProjectChannel> & {
  id: string;
};
export type ProjectChannelWithProject = SelectProjectChannel & {
  project: SelectProject;
};

// Input types for API operations
export type CreateProjectChannelInput = {
  projectId: string;
  name: string;
  description?: string;
};

export type ProjectChannelWithLastMessage = SelectProjectChannel & {
  lastMessage?: {
    id: string;
    content: string;
    authorId: string;
    createdAt: Date;
    updatedAt: Date;
  };
};

// Query filters
export type ProjectChannelFilters = {
  includeInactive?: boolean;
  includeArchived?: boolean;
  limit?: number;
  offset?: number;
};

// Re-export base types for convenience
export type { SelectProjectChannel, InsertProjectChannel };
