// Centralized mock data exports
export * from "./types";
export * from "./users";
export * from "./projects";
export * from "./agents";

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
