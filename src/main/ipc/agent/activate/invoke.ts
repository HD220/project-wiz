import { z } from "zod";
import { findAgent, updateAgent, findUser } from "@/main/ipc/agent/queries";
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

    // Atualizar o agent para ativo
    const dbAgent = await updateAgent({
      id: agentToRestore.id,
      ownerId: agentToRestore.ownerId,
      isActive: true,
      deactivatedAt: null,
      deactivatedBy: null,
    });
    
    if (!dbAgent) {
      throw new Error("Failed to update agent");
    }

    // Buscar avatar do user
    const user = await findUser(dbAgent.id);

    // Map to API format (tipo do shared)
    const apiAgent = {
      id: dbAgent.id,
      ownerId: dbAgent.ownerId,
      name: dbAgent.name,
      role: dbAgent.role,
      backstory: dbAgent.backstory,
      goal: dbAgent.goal,
      providerId: dbAgent.providerId,
      modelConfig: dbAgent.modelConfig,
      status: dbAgent.status,
      avatar: user?.avatar || null,
      createdAt: new Date(dbAgent.createdAt),
      updatedAt: new Date(dbAgent.updatedAt),
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
      restore: InferHandler<typeof handler>
    }
  }
}