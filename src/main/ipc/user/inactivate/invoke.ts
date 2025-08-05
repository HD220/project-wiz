import { z } from "zod";
import { softDeleteUser } from "@/main/ipc/user/queries";
import { requireAuth } from "@/main/services/session-registry";
import { getLogger } from "@/shared/services/logger/config";
import { eventBus } from "@/shared/services/events/event-bus";

const logger = getLogger("user.soft-delete.invoke");

// Input schema
const SoftDeleteUserInputSchema = z.object({
  id: z.string(),
  deletedBy: z.string()
});

// Output schema
const SoftDeleteUserOutputSchema = z.object({
  success: z.boolean(),
  message: z.string()
});

type SoftDeleteUserInput = z.infer<typeof SoftDeleteUserInputSchema>;
type SoftDeleteUserOutput = z.infer<typeof SoftDeleteUserOutputSchema>;

export default async function(input: { id: string }): Promise<SoftDeleteUserOutput> {
  logger.debug("Soft deleting user", { userId: input.id });

  // 1. Validate input
  const validatedInput = z.object({ id: z.string() }).parse(input);

  // 2. Check authentication
  const currentUser = requireAuth();
  
  // 3. Execute core business logic
  const success = await softDeleteUser(validatedInput.id, currentUser.id);
  
  // 4. Mapeamento inline
  const apiResult = {
    success,
    message: success ? "User soft deleted successfully with cascading" : "Failed to soft delete user"
  };
  
  // 5. Validate output
  const result = SoftDeleteUserOutputSchema.parse(apiResult);
  
  logger.debug("User soft deleted", { userId: input.id, success: result.success });
  
  // 6. Emit specific event for deletion
  if (result.success) {
    eventBus.emit("user:deleted", { userId: input.id });
  }
  
  return result;
}

declare global {
  namespace WindowAPI {
    interface User {
      inactivate: (input: { id: string }) => Promise<SoftDeleteUserOutput>
    }
  }
}