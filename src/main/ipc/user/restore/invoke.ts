import { 
  restoreUser,
  type RestoreUserInput,
  type RestoreUserOutput 
} from "./model";
import { requireAuth } from "@/main/utils/session-registry";
import { getLogger } from "@/shared/logger/config";
import { eventBus } from "@/main/core/event-bus";

const logger = getLogger("user.restore.invoke");

export default async function(userId: RestoreUserInput): Promise<RestoreUserOutput> {
  logger.debug("Restoring user", { userId });

  // 1. Check authentication
  const currentUser = requireAuth();
  
  // 2. Execute core business logic
  const result = await restoreUser(userId);
  
  logger.debug("User restored", { 
    userId: result.id, 
    name: result.name,
    isActive: result.isActive
  });
  
  // 3. Emit specific event for restoration
  eventBus.emit("user:restored", { userId: result.id });
  
  return result;
}

declare global {
  namespace WindowAPI {
    interface User {
      restore: (userId: RestoreUserInput) => Promise<RestoreUserOutput>
    }
  }
}