import { z } from "zod";

import { listAgents } from "@/main/ipc/agent/queries";
import { requireAuth } from "@/main/services/session-registry";

import { getLogger } from "@/shared/services/logger/config";
import { AgentSchema } from "@/shared/types";
import {
  createIPCHandler,
  InferHandler,
} from "@/shared/utils/create-ipc-handler";

const logger = getLogger("agent.list.invoke");

const ListAgentsInputSchema = z
  .object({
    search: z.string().optional(),
    showInactive: z.boolean().optional().default(false),
  })
  .default({});

const ListAgentsOutputSchema = z.array(AgentSchema);

const handler = createIPCHandler({
  inputSchema: ListAgentsInputSchema,
  outputSchema: ListAgentsOutputSchema,
  handler: async (input) => {
    logger.debug("Listing agents");

    const currentUser = requireAuth();

    // Query recebe dados e gerencia campos técnicos internamente
    const dbAgents = await listAgents({
      ownerId: currentUser.id,
      search: input?.search,
      showInactive: input?.showInactive,
    });

    // Mapear agents (dados já vem completos do JOIN)
    const apiAgents = dbAgents.map((agent) => {
      logger.debug("Processing agent from DB", {
        agentId: agent.id,
        modelConfigType: typeof agent.modelConfig,
      });
      logger.debug("Raw modelConfig content", agent.modelConfig);

      // modelConfig already comes parsed as object from transformToAgent()
      const parsedModelConfig = agent.modelConfig;

      return {
        // Identity fields (users)
        id: agent.id,
        name: agent.name,
        avatar: agent.avatar,
        type: agent.type,
        status: agent.status,

        // State management (users)
        deactivatedAt: agent.deactivatedAt
          ? new Date(agent.deactivatedAt)
          : null,

        // Timestamps (users)
        createdAt: new Date(agent.createdAt),
        updatedAt: new Date(agent.updatedAt),

        // Agent-specific fields (agents)
        ownerId: agent.ownerId,
        role: agent.role,
        backstory: agent.backstory,
        goal: agent.goal,
        providerId: agent.providerId,
        modelConfig: parsedModelConfig,
      };
    });

    logger.debug("Listed agents", { count: apiAgents.length });

    return apiAgents;
  },
});

export default handler;

declare global {
  namespace WindowAPI {
    interface Agent {
      list: InferHandler<typeof handler>;
    }
  }
}
