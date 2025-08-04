import { 
  softDeleteUser,
  type SoftDeleteUserInput,
  type SoftDeleteUserOutput 
} from "./model";
import { requireAuth } from "@/main/utils/session-registry";
import { getLogger } from "@/shared/logger/config";
import { eventBus } from "@/main/core/event-bus";

const logger = getLogger("user.soft-delete.invoke");

// Input type para o invoke (sem deletedBy que é adicionado automaticamente)
export type SoftDeleteUserInvokeInput = Omit<SoftDeleteUserInput, "deletedBy">;

export default async function(input: SoftDeleteUserInvokeInput): Promise<SoftDeleteUserOutput> {
  logger.debug("Soft deleting user", { userId: input.userId });

  // 1. Check authentication
  const currentUser = requireAuth();
  
  // 2. Add deletedBy from current user
  const deleteData = {
    ...input,
    deletedBy: currentUser.id
  };
  
  // 3. Execute core business logic
  const result = await softDeleteUser(deleteData);
  
  logger.debug("User soft deleted", { userId: input.userId, success: result.success });
  
  // 4. Emit specific event for deletion
  if (result.success) {
    eventBus.emit("user:deleted", { userId: input.userId });
  }
  
  return result;
}

declare global {
  namespace WindowAPI {
    interface User {
      softDelete: (input: SoftDeleteUserInvokeInput) => Promise<SoftDeleteUserOutput>
    }
  }
}