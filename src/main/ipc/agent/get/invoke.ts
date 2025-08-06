import { z } from "zod";
import { findAgent } from "@/main/ipc/agent/queries";
import { AgentSchema } from "@/shared/types";
import { requireAuth } from "@/main/services/session-registry";
import { getLogger } from "@/shared/services/logger/config";
import { createIPCHandler, InferHandler } from "@/shared/utils/create-ipc-handler";

const logger = getLogger("agent.get.invoke");

const GetAgentInputSchema = z.object({
  agentId: z.string().min(1, "Agent ID is required"),
});

const GetAgentOutputSchema = AgentSchema.nullable();

const handler = createIPCHandler({
  inputSchema: GetAgentInputSchema,
  outputSchema: GetAgentOutputSchema,
  handler: async (input) => {
    logger.debug("Getting agent", { agentId: input.agentId });

    const currentUser = requireAuth();

    // Find agent with ownership validation
    const dbAgent = await findAgent(input.agentId, currentUser.id);
    
    if (!dbAgent) {
      return null;
    }

    // Mapeamento completo (dados já vem do JOIN)
    const apiAgent = {
      // Identity fields (users)
      id: dbAgent.id,
      name: dbAgent.name,
      avatar: dbAgent.avatar,
      type: dbAgent.type,
      
      // State management (users)
      isActive: dbAgent.isActive,
      deactivatedAt: dbAgent.deactivatedAt ? new Date(dbAgent.deactivatedAt) : null,
      deactivatedBy: dbAgent.deactivatedBy,
      
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
    
    logger.debug("Agent get result", { found: apiAgent !== null });
    
    return apiAgent;
  }
});

export default handler;

declare global {
  namespace WindowAPI {
    interface Agent {
      get: InferHandler<typeof handler>
    }
  }
}