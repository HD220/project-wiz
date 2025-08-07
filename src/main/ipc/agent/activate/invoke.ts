import { z } from "zod";
import { findAgent, updateAgent } from "@/main/ipc/agent/queries";
import { AgentSchema } from "@/shared/types";
import { requireAuth } from "@/main/services/session-registry";
import { eventBus } from "@/shared/services/events/event-bus";
import { getLogger } from "@/shared/services/logger/config";
import { createIPCHandler, InferHandler } from "@/shared/utils/create-ipc-handler";

const logger = getLogger("agent.restore.invoke");

const RestoreAgentInputSchema = z.object({
  agentId: z.string().min(1, "Agent ID is required"),
});

const RestoreAgentOutputSchema = AgentSchema;

const handler = createIPCHandler({
  inputSchema: RestoreAgentInputSchema,
  outputSchema: RestoreAgentOutputSchema,
  handler: async (input) => {
    logger.debug("Restoring agent", { agentId: input.agentId });

    const currentUser = requireAuth();
    
    // Validar se existe e se o user tem autorização
    const agentToRestore = await findAgent(input.agentId, currentUser.id);

    if (!agentToRestore) {
      throw new Error("Agent not found for current user session");
    }

    // Só atualizar status do agent (dados de user são mantidos)
    const dbAgent = await updateAgent({
      id: agentToRestore.id,
      ownerId: agentToRestore.ownerId,
      status: "active", // Reativar o agent
    });
    
    if (!dbAgent) {
      throw new Error("Failed to update agent");
    }

    // Map to API format (dados completos do JOIN)
    const apiAgent = {
      // Identity fields (users)
      id: dbAgent.id,
      name: dbAgent.name,
      avatar: dbAgent.avatar,
      type: dbAgent.type,
      
      // State management (users)
      isActive: !dbAgent.deactivatedAt,
      deactivatedAt: dbAgent.deactivatedAt ? new Date(dbAgent.deactivatedAt) : null,
      
      // Timestamps (users)
      createdAt: new Date(dbAgent.createdAt),
      updatedAt: new Date(dbAgent.updatedAt),
      
      // Agent-specific fields (agents)
      ownerId: dbAgent.ownerId,
      role: dbAgent.role,
      backstory: dbAgent.backstory,
      goal: dbAgent.goal,
      providerId: dbAgent.providerId,
      modelConfig: JSON.parse(dbAgent.modelConfig),
      status: dbAgent.status,
    };
    
    // Emit event
    eventBus.emit("agent:restored", { agentId: apiAgent.id });
    
    logger.debug("Agent restored", { agentId: apiAgent.id });
    
    return apiAgent;
  }
});

export default handler;

declare global {
  namespace WindowAPI {
    interface Agent {
      activate: InferHandler<typeof handler>
    }
  }
}