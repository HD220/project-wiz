// Re-export das funções organizadas por agregado

// PROJECT CRUD OPERATIONS (Aggregate Root)
export {
  createProject,
  findProjectById,
  findAllProjects,
  updateProject,
  deleteProject,
  archiveProject,
  CreateProjectSchema,
  UpdateProjectSchema,
  dbToProjectData,
} from "./functions/project-crud.functions";

export type {
  CreateProjectInput,
  UpdateProjectInput,
} from "./functions/project-crud.functions";

// CHANNEL CRUD OPERATIONS (Pertence ao Project)
export {
  createChannel,
  findChannelById,
  findChannelsByProjectId,
  updateChannel,
  deleteChannel,
  CreateChannelSchema,
  UpdateChannelSchema,
  dbToChannelData,
} from "./functions/channel-crud.functions";

export type {
  CreateChannelInput,
  UpdateChannelInput,
} from "./functions/channel-crud.functions";
