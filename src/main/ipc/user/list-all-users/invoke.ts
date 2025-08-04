import { 
  getAllUsers,
  type ListAllUsersInput,
  type ListAllUsersOutput 
} from "./model";
import { requireAuth } from "@/main/utils/session-registry";
import { getLogger } from "@/shared/logger/config";

const logger = getLogger("user.list-all-users.invoke");

export default async function(input: ListAllUsersInput): Promise<ListAllUsersOutput> {
  logger.debug("Listing all users", { includeInactive: input.includeInactive });

  // 1. Check authentication
  const currentUser = requireAuth();
  
  // 2. Execute core business logic
  const result = await getAllUsers(input);
  
  logger.debug("All users listed", { 
    userCount: result.length, 
    includeInactive: input.includeInactive 
  });
  
  return result;
}

declare global {
  namespace WindowAPI {
    interface User {
      listAllUsers: (input: ListAllUsersInput) => Promise<ListAllUsersOutput>
    }
  }
}