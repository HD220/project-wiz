import { 
  getUserStats,
  type GetUserStatsInput,
  type GetUserStatsOutput 
} from "./model";
import { requireAuth } from "@/main/utils/session-registry";
import { getLogger } from "@/shared/logger/config";

const logger = getLogger("user.get-user-stats.invoke");

export default async function(userId: GetUserStatsInput): Promise<GetUserStatsOutput> {
  logger.debug("Getting user stats", { userId });

  // 1. Check authentication
  const currentUser = requireAuth();
  
  // 2. Execute core business logic
  const result = await getUserStats(userId);
  
  logger.debug("User stats retrieved", { 
    userId, 
    ownedAgentsActive: result.ownedAgents.active,
    ownedProjectsActive: result.ownedProjects.active,
    activeSessions: result.activeSessions
  });
  
  // 3. No event emission for stats retrieval (it's just a query)
  
  return result;
}

declare global {
  namespace WindowAPI {
    interface User {
      getUserStats: (userId: GetUserStatsInput) => Promise<GetUserStatsOutput>
    }
  }
}