import { z } from "zod";
import { activateUser } from "@/main/ipc/user/queries";
import { UserSchema } from "@/shared/types";
import { requireAuth } from "@/main/services/session-registry";
import { getLogger } from "@/shared/services/logger/config";
import { eventBus } from "@/shared/services/events/event-bus";

const logger = getLogger("user.activate.invoke");

// Input schema - apenas userId
const ActivateUserInputSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
});

// Output schema - estende UserSchema
const ActivateUserOutputSchema = UserSchema;

type ActivateUserInput = z.infer<typeof ActivateUserInputSchema>;
type ActivateUserOutput = z.infer<typeof ActivateUserOutputSchema>;

export default async function(input: ActivateUserInput): Promise<ActivateUserOutput> {
  logger.debug("Activating user", { userId: input.userId });

  // 1. Validate input
  const validatedInput = ActivateUserInputSchema.parse(input);

  // 2. Check authentication
  const currentUser = requireAuth();
  
  // 3. Execute query
  const dbUser = await activateUser(validatedInput.userId);
  
  if (!dbUser) {
    throw new Error("User not found or cannot be activated");
  }
  
  // 4. Map database result to API format
  const apiUser = {
    id: dbUser.id,
    name: dbUser.name,
    avatar: dbUser.avatar,
    type: dbUser.type,
    createdAt: new Date(dbUser.createdAt),
    updatedAt: new Date(dbUser.updatedAt),
  };
  
  logger.debug("User activated", { userId: apiUser.id });
  
  // 5. Emit event
  eventBus.emit("user:activated", { userId: apiUser.id, activatedBy: currentUser.id });
  
  // 6. Return result
  return apiUser;
}

declare global {
  namespace WindowAPI {
    interface User {
      activate: (input: ActivateUserInput) => Promise<ActivateUserOutput>
    }
  }
}