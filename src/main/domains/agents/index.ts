// Agents Domain - Simplified Structure
// Consolidated from 30+ files to 3 essential files

// Main exports
export { Agent, type AgentData } from "./agent.entity";
export * from "./agent.functions";

// Legacy exports for backward compatibility (temporary)
// These re-export the new consolidated functions with old names
export { createAgent as agentCreate } from "./agent.functions";
export { findAgentById as agentQuery } from "./agent.functions";
export { updateAgent as agentUpdate } from "./agent.functions";
export { findAllAgents as agentList } from "./agent.functions";
export { deleteAgent as agentDelete } from "./agent.functions";
export { activateAgent as agentActivate } from "./agent.functions";
export { deactivateAgent as agentDeactivate } from "./agent.functions";

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
