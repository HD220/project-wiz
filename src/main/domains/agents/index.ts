// Clean exports - single source of truth
export { Agent } from "./agent.entity";
export { AgentsService } from "./agents.service";
export { AgentsRepository } from "./agents.repository";
export type { CreateAgentData, UpdateAgentData } from "./agents.repository";

// Create singleton service instance
const agentsService = new AgentsService();

// Export convenient functions that use the service
export const createAgent = agentsService.createAgent.bind(agentsService);
export const getAgentById = agentsService.getAgentById.bind(agentsService);
export const getAllAgents = agentsService.getAllAgents.bind(agentsService);
export const getActiveAgents =
  agentsService.getActiveAgents.bind(agentsService);
export const updateAgent = agentsService.updateAgent.bind(agentsService);
export const deleteAgent = agentsService.deleteAgent.bind(agentsService);
export const activateAgent = agentsService.activateAgent.bind(agentsService);
export const deactivateAgent =
  agentsService.deactivateAgent.bind(agentsService);
export const startWork = agentsService.startWork.bind(agentsService);
export const completeWork = agentsService.completeWork.bind(agentsService);
export const getAgentStats = agentsService.getAgentStats.bind(agentsService);

// Worker operations (keeping existing if needed)
export { AgentWorker } from "./functions/agent.worker";
export { AgentQueue } from "./functions/agent.queue";
export { AgentTaskProcessor } from "./functions/agent-task-processor";

// Simplified task management
export type AgentTaskData = Record<string, unknown>;

export interface AgentTask {
  id: string;
  agentId: string;
  status: "pending" | "running" | "completed" | "failed";
  priority: "low" | "medium" | "high";
  data: AgentTaskData;
  createdAt: Date;
  updatedAt: Date;
}
