import { z } from "zod";
import { updateUser } from "@/main/ipc/user/queries";
import { UserSchema } from "@/shared/types";
import { requireAuth } from "@/main/services/session-registry";
import { getLogger } from "@/shared/services/logger/config";
import { eventBus } from "@/shared/services/events/event-bus";

const logger = getLogger("user.update.invoke");

// Input schema - apenas campos de negócio + id
const UpdateUserInputSchema = UserSchema.pick({
  name: true,
  avatar: true
}).partial().extend({
  id: z.string()
});

// Output schema
const UpdateUserOutputSchema = UserSchema;

type UpdateUserInput = z.infer<typeof UpdateUserInputSchema>;
type UpdateUserOutput = z.infer<typeof UpdateUserOutputSchema>;

export default async function(input: UpdateUserInput): Promise<UpdateUserOutput> {
  logger.debug("Updating user", { userId: input.id });

  // 1. Validate input
  const validatedInput = UpdateUserInputSchema.parse(input);

  // 2. Check authentication
  const currentUser = requireAuth();
  
  // 3. Extract id and prepare update data
  const { id, ...updateData } = validatedInput;
  
  // 4. Query recebe dados separados
  const dbUser = await updateUser(id, updateData);
  
  if (!dbUser) {
    throw new Error("User not found, inactive, or update failed");
  }
  
  // 5. Mapeamento: SelectUser → User (sem campos técnicos)
  const apiUser = {
    id: dbUser.id,
    name: dbUser.name,
    avatar: dbUser.avatar,
    type: dbUser.type,
    createdAt: new Date(dbUser.createdAt),
    updatedAt: new Date(dbUser.updatedAt),
  };
  
  // 6. Validate output
  const result = UpdateUserOutputSchema.parse(apiUser);
  
  logger.debug("User updated", { 
    userId: result.id, 
    name: result.name
  });
  
  // 7. Emit specific event for update
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