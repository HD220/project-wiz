// Projects Domain - Simplified Structure
// Consolidated from 20+ files to 3 essential files

// Main exports
export {
  Project,
  Channel,
  type ProjectData,
  type ChannelData,
} from "./project.entity";
export * from "./project.functions";

// Legacy exports for backward compatibility (temporary)
// These re-export the new consolidated functions with old names
export { createProject as projectCreate } from "./project.functions";
export { findProjectById as projectQuery } from "./project.functions";
export { updateProject as projectUpdate } from "./project.functions";
export { findAllProjects as projectList } from "./project.functions";
export { deleteProject as projectDelete } from "./project.functions";
export { archiveProject as projectArchive } from "./project.functions";

export { createChannel as channelCreate } from "./project.functions";
export { findChannelById as channelQuery } from "./project.functions";
export { updateChannel as channelUpdate } from "./project.functions";
export { findChannelsByProjectId as channelListByProject } from "./project.functions";
export { deleteChannel as channelDelete } from "./project.functions";

// Simplified message management
export interface ProjectMessage {
  id: string;
  channelId: string;
  userId: string;
  content: string;
  type: "user" | "assistant" | "system";
  createdAt: Date;
  updatedAt: Date;
}

// Helper types
export interface ProjectWithChannels {
  project: Project;
  channels: Channel[];
}
