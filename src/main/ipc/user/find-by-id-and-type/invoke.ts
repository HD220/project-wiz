import { 
  getUserByIdAndType,
  type FindUserByIdAndTypeInput,
  type FindUserByIdAndTypeOutput 
} from "./model";
import { requireAuth } from "@/main/utils/session-registry";
import { getLogger } from "@/shared/logger/config";

const logger = getLogger("user.find-by-id-and-type.invoke");

export default async function(input: FindUserByIdAndTypeInput): Promise<FindUserByIdAndTypeOutput> {
  logger.debug("Finding user by ID and type", { 
    userId: input.userId, 
    type: input.type,
    includeInactive: input.includeInactive 
  });

  // 1. Check authentication
  const currentUser = requireAuth();
  
  // 2. Execute core business logic
  const result = await getUserByIdAndType(input);
  
  logger.debug("User find by ID and type result", { 
    userId: input.userId, 
    type: input.type,
    found: result !== null
  });
  
  return result;
}

declare global {
  namespace WindowAPI {
    interface User {
      findByIdAndType: (input: FindUserByIdAndTypeInput) => Promise<FindUserByIdAndTypeOutput>
    }
  }
}