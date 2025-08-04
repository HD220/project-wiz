import { z } from "zod";
import { restoreUser } from "./queries";
import { UserSchema } from "@/shared/types";
import { requireAuth } from "@/main/services/session-registry";
import { getLogger } from "@/shared/logger/config";
import { eventBus } from "@/shared/events/event-bus";

const logger = getLogger("user.restore.invoke");

// Input schema
const RestoreUserInputSchema = z.string().min(1);

// Output schema
const RestoreUserOutputSchema = z.object({
  success: z.boolean(),
  user: UserSchema.nullable(),
  message: z.string()
});

type RestoreUserInput = z.infer<typeof RestoreUserInputSchema>;
type RestoreUserOutput = z.infer<typeof RestoreUserOutputSchema>;

export default async function(input: RestoreUserInput): Promise<RestoreUserOutput> {
  logger.debug("Restoring user");

  // 1. Validate input
  const validatedInput = RestoreUserInputSchema.parse(input);

  // 2. Check authentication
  const currentUser = requireAuth();
  
  // 3. Query recebe dados e gerencia campos técnicos internamente
  const dbUser = await restoreUser(validatedInput);
  
  if (!dbUser) {
    const result = RestoreUserOutputSchema.parse({
      success: false,
      user: null,
      message: "User not found or not in soft deleted state"
    });
    return result;
  }
  
  // 4. Mapeamento: SelectUser → User (sem campos técnicos)
  const apiUser = {
    id: dbUser.id,
    name: dbUser.name,
    avatar: dbUser.avatar,
    type: dbUser.type,
    createdAt: new Date(dbUser.createdAt),
    updatedAt: new Date(dbUser.updatedAt),
  };
  
  // 5. Validate output
  const result = RestoreUserOutputSchema.parse({
    success: true,
    user: apiUser,
    message: "User restored successfully"
  });
  
  logger.debug("User restored", { 
    userId: result.user?.id, 
    name: result.user?.name
  });
  
  // 6. Emit specific event for restoration
  eventBus.emit("user:restored", { userId: result.user!.id });
  
  return result;
}

declare global {
  namespace WindowAPI {
    interface User {
      restore: (input: RestoreUserInput) => Promise<RestoreUserOutput>
    }
  }
}