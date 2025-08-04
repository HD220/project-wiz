import { 
  updateUser,
  type UpdateUserInput,
  type UpdateUserOutput 
} from "./model";
import { requireAuth } from "@/main/utils/session-registry";
import { getLogger } from "@/shared/logger/config";
import { eventBus } from "@/main/core/event-bus";

const logger = getLogger("user.update.invoke");

export default async function(input: UpdateUserInput): Promise<UpdateUserOutput> {
  logger.debug("Updating user", { userId: input.id });

  // 1. Check authentication
  const currentUser = requireAuth();
  
  // 2. Execute core business logic
  const result = await updateUser(input);
  
  logger.debug("User updated", { 
    userId: result.id, 
    name: result.name
  });
  
  // 3. Emit specific event for update
  eventBus.emit("user:updated", { userId: result.id });
  
  return result;
}

declare global {
  namespace WindowAPI {
    interface User {
      update: (input: UpdateUserInput) => Promise<UpdateUserOutput>
    }
  }
}