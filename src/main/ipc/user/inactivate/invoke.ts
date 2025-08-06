import { z } from "zod";
import { softDeleteUser } from "@/main/ipc/user/queries";
import { requireAuth } from "@/main/services/session-registry";
import { getLogger } from "@/shared/services/logger/config";
import { eventBus } from "@/shared/services/events/event-bus";

const logger = getLogger("user.soft-delete.invoke");

// Input schema - object wrapper para consistência
const SoftDeleteUserInputSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
});

// Output schema - void para operações de inativação
const SoftDeleteUserOutputSchema = z.void();

type SoftDeleteUserInput = z.infer<typeof SoftDeleteUserInputSchema>;
type SoftDeleteUserOutput = z.infer<typeof SoftDeleteUserOutputSchema>;

export default async function(input: SoftDeleteUserInput): Promise<SoftDeleteUserOutput> {
  logger.debug("Soft deleting user", { userId: input.userId });

  // 1. Validate input
  const validatedInput = SoftDeleteUserInputSchema.parse(input);

  // 2. Check authentication
  const currentUser = requireAuth();
  
  // 3. Execute core business logic
  const success = await softDeleteUser(validatedInput.userId, currentUser.id);
  
  if (!success) {
    throw new Error("Failed to soft delete user");
  }
  
  logger.debug("User soft deleted", { userId: validatedInput.userId });
  
  // 4. Emit specific event for deletion
  eventBus.emit("user:deleted", { userId: validatedInput.userId });
  
  return undefined;
}

declare global {
  namespace WindowAPI {
    interface User {
      inactivate: (input: SoftDeleteUserInput) => Promise<SoftDeleteUserOutput>
    }
  }
}