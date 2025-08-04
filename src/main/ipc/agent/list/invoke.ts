import { 
  listAgents,
  type ListAgentsInput,
  type ListAgentsOutput 
} from "./queries";
import { requireAuth } from "@/main/utils/session-registry";
import { getLogger } from "@/shared/logger/config";

const logger = getLogger("agent.list.invoke");

// Input type para o invoke (sem ownerId que é adicionado automaticamente)
export type ListAgentsInvokeInput = Omit<NonNullable<ListAgentsInput>, "ownerId">;

export default async function(filters?: ListAgentsInvokeInput): Promise<ListAgentsOutput> {
  logger.debug("Listing agents for user");

  // 1. Check authentication (replicando a lógica do handler original)
  const currentUser = requireAuth();
  
  // 2. Add ownerId from current user
  const agentFilters = filters ? {
    ...filters,
    ownerId: currentUser.id
  } : {
    ownerId: currentUser.id
  };
  
  // 3. Execute core business logic
  const result = await listAgents(agentFilters);
  
  logger.debug("Listed agents", { count: result.length, ownerId: currentUser.id });
  
  return result;
}

declare global {
  namespace WindowAPI {
    interface Agent {
      list: (filters?: ListAgentsInvokeInput) => Promise<ListAgentsOutput>
    }
  }
}