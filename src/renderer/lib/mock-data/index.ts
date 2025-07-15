// Centralized mock data exports
export * from "./types";
export * from "./users";
export * from "./projects";
export * from "./agents";

// Legacy compatibility re-exports
import { mockUser } from "./users";
import { mockProjects, getProjectById } from "./projects";
import { mockAgents, getAgentById, getAgentsByProject } from "./agents";

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