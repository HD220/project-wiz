// Centralized mock data exports
export * from "./types";
export * from "./users";
export * from "./projects";
export * from "./agents";
export * from "./files";
export * from "./tasks";
export * from "./terminal";

// Legacy compatibility re-exports
import { mockAgents, getAgentById, getAgentsByProject } from "./agents";
import { mockProjects, getProjectById } from "./projects";
import { mockUser } from "./users";

export {
  // Users
  mockUser,

  // Projects
  mockProjects,
  getProjectById,

  // Agents
  mockAgents,
  getAgentById,
  getAgentsByProject,
};
