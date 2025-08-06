import { z } from "zod";
import { findAgent, updateAgent } from "@/main/ipc/agent/queries";
import { requireAuth } from "@/main/services/session-registry";
import { eventBus } from "@/shared/services/events/event-bus";
import { getLogger } from "@/shared/services/logger/config";
import { createIPCHandler, InferHandler } from "@/shared/utils/create-ipc-handler";

const logger = getLogger("agent.delete.invoke");

const DeleteAgentInputSchema = z.object({
  id: z.string(),
});

const DeleteAgentOutputSchema = z.void();

const handler = createIPCHandler({
  inputSchema: DeleteAgentInputSchema,
  outputSchema: DeleteAgentOutputSchema,
  handler: async (input) => {
    logger.debug("Deleting agent");

    const currentUser = requireAuth();
    
    // Validar se existe e se o user tem autorização
    const agentToDeactivate = await findAgent(input.id, currentUser.id);

    if (!agentToDeactivate) {
      throw new Error("Agent not found for current user session");
    }

    // Atualizar o agent para inativo
    await updateAgent({
      id: agentToDeactivate.id,
      ownerId: agentToDeactivate.ownerId,
      isActive: false,
      deactivatedAt: new Date(),
      deactivatedBy: currentUser.id,
    });
    
    // Emit event
    eventBus.emit("agent:deleted", { agentId: input.id });
    
    logger.debug("Agent deleted", { agentId: input.id });
    
    return undefined;
  }
});

export default handler;

declare global {
  namespace WindowAPI {
    interface Agent {
      delete: InferHandler<typeof handler>
    }
  }
}