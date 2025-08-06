import { z } from "zod";
import { findAgent, findUser } from "@/main/ipc/agent/queries";
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

    // Buscar avatar do user
    const user = await findUser(dbAgent.id);

    // Mapeamento: SelectAgent → Agent (sem campos técnicos)
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