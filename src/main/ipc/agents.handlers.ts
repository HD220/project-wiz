import { createCrudHandlers } from "../kernel/ipc/handler-factory";
import {
  createAgent,
  findAgentById,
  findAllAgents,
  updateAgent,
  deleteAgent,
  activateAgent,
  deactivateAgent,
} from "../domains/agents/agent.functions";

export function registerAgentHandlers(): void {
  createCrudHandlers(
    "agent",
    {
      create: createAgent,
      findById: findAgentById,
      findAll: findAllAgents,
      update: updateAgent,
      delete: deleteAgent,
    },
    {
      listActive: async () => {
        const agents = await findAllAgents();
        return agents.filter((agent) => agent.isActive());
      },
      activate: async (data) => {
        const { id } = data as { id: string };
        return await activateAgent(id);
      },
      deactivate: async (data) => {
        const { id } = data as { id: string };
        return await deactivateAgent(id);
      },
    },
  );
}
