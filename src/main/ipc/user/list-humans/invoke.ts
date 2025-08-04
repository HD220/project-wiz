import { 
  getHumans,
  type ListHumansInput,
  type ListHumansOutput 
} from "./model";
import { requireAuth } from "@/main/utils/session-registry";
import { getLogger } from "@/shared/logger/config";

const logger = getLogger("user.list-humans.invoke");

export default async function(input: ListHumansInput): Promise<ListHumansOutput> {
  logger.debug("Listing human users", { includeInactive: input.includeInactive });

  // 1. Check authentication
  const currentUser = requireAuth();
  
  // 2. Execute core business logic
  const result = await getHumans(input);
  
  logger.debug("Human users listed", { 
    userCount: result.length, 
    includeInactive: input.includeInactive 
  });
  
  return result;
}

declare global {
  namespace WindowAPI {
    interface User {
      listHumans: (input: ListHumansInput) => Promise<ListHumansOutput>
    }
  }
}