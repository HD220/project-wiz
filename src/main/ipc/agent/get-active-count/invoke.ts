import { 
  getActiveAgentsCount,
  type GetActiveCountOutput 
} from "./queries";
import { requireAuth } from "@/main/utils/session-registry";
import { getLogger } from "@/shared/logger/config";

const logger = getLogger("agent.get-active-count.invoke");

export default async function(): Promise<GetActiveCountOutput> {
  logger.debug("Getting active agents count for user");

  // 1. Check authentication (replicando a lógica do handler original)
  const currentUser = requireAuth();
  
  // 2. Execute core business logic
  const result = await getActiveAgentsCount({ ownerId: currentUser.id });
  
  logger.debug("Got active agents count", { count: result.count, ownerId: currentUser.id });
  
  return result;
}

declare global {
  namespace WindowAPI {
    interface Agent {
      getActiveCount: () => Promise<GetActiveCountOutput>
    }
  }
}