import { z } from "zod";
import { listAgents, findUser } from "@/main/ipc/agent/queries";
import { AgentSchema } from "@/shared/types";
import { requireAuth } from "@/main/services/session-registry";
import { getLogger } from "@/shared/services/logger/config";
import { createIPCHandler, InferHandler } from "@/shared/utils/create-ipc-handler";

const logger = getLogger("agent.list.invoke");

const ListAgentsInputSchema = z.object({
  status: z.enum(["active", "inactive", "busy"]).optional(),
  search: z.string().optional(),
  showInactive: z.boolean().optional().default(false),
}).default({});

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
      status: input.status,
      search: input.search,
      showInactive: input.showInactive,
    });
    
    // Buscar avatars dos users para todos os agents
    const apiAgents = await Promise.all(
      dbAgents.map(async (agent) => {
        const user = await findUser(agent.id);
        return {
          id: agent.id,
          ownerId: agent.ownerId,
          name: agent.name,
          role: agent.role,
          backstory: agent.backstory,
          goal: agent.goal,
          providerId: agent.providerId,
          modelConfig: JSON.parse(agent.modelConfig),
          status: agent.status,
          avatar: user?.avatar || null,
          createdAt: new Date(agent.createdAt),
          updatedAt: new Date(agent.updatedAt),
        };
      })
    );
    
    logger.debug("Listed agents", { count: apiAgents.length });
    
    return apiAgents;
  }
});

export default handler;

declare global {
  namespace WindowAPI {
    interface Agent {
      list: InferHandler<typeof handler>
    }
  }
}