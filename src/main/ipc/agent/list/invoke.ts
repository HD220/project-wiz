import { z } from "zod";
import { listAgents, findUser } from "@/main/ipc/agent/queries";
import { AgentSchema } from "@/shared/types";
import { requireAuth } from "@/main/services/session-registry";
import { getLogger } from "@/shared/services/logger/config";

const logger = getLogger("agent.list.invoke");

// Input schema - campos de filtro (sem ownerId que é adicionado automaticamente)
const ListAgentsInputSchema = z.object({
  status: z.enum(["active", "inactive", "busy"]).optional(),
  search: z.string().optional(),
  showInactive: z.boolean().optional().default(false),
}).default({});

// Output schema - array de Agent
const ListAgentsOutputSchema = z.array(AgentSchema);

type ListAgentsInput = z.infer<typeof ListAgentsInputSchema>;
type ListAgentsOutput = z.infer<typeof ListAgentsOutputSchema>;

export default async function(input?: ListAgentsInput): Promise<ListAgentsOutput> {
  logger.debug("Listing agents");

  // 1. Validate input - usa schema default se input for undefined
  const validatedInput = ListAgentsInputSchema.parse(input || {});

  // 2. Check authentication
  const currentUser = requireAuth();
  
  // 3. Query recebe dados e gerencia campos técnicos internamente
  const dbAgents = await listAgents({
    ownerId: currentUser.id,
    status: validatedInput.status,
    search: validatedInput.search,
    showInactive: validatedInput.showInactive,
  });
  
  // 4. Buscar avatars dos users para todos os agents
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
  
  // 5. Validate output
  const result = ListAgentsOutputSchema.parse(apiAgents);
  
  logger.debug("Listed agents", { count: result.length });
  
  return result;
}

declare global {
  namespace WindowAPI {
    interface Agent {
      list: (input?: ListAgentsInput) => Promise<ListAgentsOutput>
    }
  }
}