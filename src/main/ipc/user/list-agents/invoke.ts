import { 
  getAgents,
  type ListAgentsInput,
  type ListAgentsOutput 
} from "./model";
import { requireAuth } from "@/main/utils/session-registry";
import { getLogger } from "@/shared/logger/config";

const logger = getLogger("user.list-agents.invoke");

export default async function(input: ListAgentsInput): Promise<ListAgentsOutput> {
  logger.debug("Listing agent users", { includeInactive: input.includeInactive });

  // 1. Check authentication
  const currentUser = requireAuth();
  
  // 2. Execute core business logic
  const result = await getAgents(input);
  
  logger.debug("Agent users listed", { 
    userCount: result.length, 
    includeInactive: input.includeInactive 
  });
  
  return result;
}

declare global {
  namespace WindowAPI {
    interface User {
      listAgents: (input: ListAgentsInput) => Promise<ListAgentsOutput>
    }
  }
}