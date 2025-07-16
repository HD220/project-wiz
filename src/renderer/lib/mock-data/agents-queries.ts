import { mockAgents } from "./agents-data";
import { Agent } from "./types";

export const getAgentById = (id: string): Agent | undefined => {
  return mockAgents.find((agent) => agent.id === id);
};

export const getAgentsByProject = (projectId: string): Agent[] => {
  return mockAgents.filter((agent) => agent.projectId === projectId);
};
