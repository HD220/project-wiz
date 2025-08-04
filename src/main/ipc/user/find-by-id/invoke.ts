import { 
  getUserById,
  type FindUserByIdInput,
  type FindUserByIdOutput 
} from "./model";
import { requireAuth } from "@/main/utils/session-registry";
import { getLogger } from "@/shared/logger/config";

const logger = getLogger("user.find-by-id.invoke");

export default async function(input: FindUserByIdInput): Promise<FindUserByIdOutput> {
  logger.debug("Finding user by ID", { userId: input.userId, includeInactive: input.includeInactive });

  // 1. Check authentication
  const currentUser = requireAuth();
  
  // 2. Execute core business logic
  const result = await getUserById(input);
  
  logger.debug("User find by ID result", { 
    userId: input.userId, 
    found: result !== null
  });
  
  return result;
}

declare global {
  namespace WindowAPI {
    interface User {
      findById: (input: FindUserByIdInput) => Promise<FindUserByIdOutput>
    }
  }
}