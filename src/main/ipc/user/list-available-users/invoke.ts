import { 
  getAvailableUsers,
  type ListAvailableUsersInput,
  type ListAvailableUsersOutput 
} from "./model";
import { requireAuth } from "@/main/utils/session-registry";
import { getLogger } from "@/shared/logger/config";

const logger = getLogger("user.list-available-users.invoke");

export default async function(params?: ListAvailableUsersInput): Promise<ListAvailableUsersOutput> {
  logger.debug("Listing available users");

  // 1. Check authentication (replicando a lógica do handler original)
  const currentUser = requireAuth();
  
  // 2. Execute core business logic
  const result = await getAvailableUsers(currentUser.id, params);
  
  logger.debug("Listed available users", { count: result.length });
  
  return result;
}

declare global {
  namespace WindowAPI {
    interface User {
      listAvailableUsers: (params?: ListAvailableUsersInput) => Promise<ListAvailableUsersOutput>
    }
  }
}