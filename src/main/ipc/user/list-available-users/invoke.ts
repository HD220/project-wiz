import { z } from "zod";
import { listAvailableUsers } from "@/main/ipc/user/queries";
import { UserSchema } from "@/shared/types";
import { requireAuth } from "@/main/services/session-registry";
import { getLogger } from "@/shared/services/logger/config";

const logger = getLogger("user.list-available-users.invoke");

// Input schema
const ListAvailableUsersInputSchema = z.object({
  currentUserId: z.string(),
  type: z.enum(["human", "agent"]).optional(),
});

// Output schema
const ListAvailableUsersOutputSchema = z.array(UserSchema);

type ListAvailableUsersInput = z.infer<typeof ListAvailableUsersInputSchema>;
type ListAvailableUsersOutput = z.infer<typeof ListAvailableUsersOutputSchema>;

export default async function(input: ListAvailableUsersInput): Promise<ListAvailableUsersOutput> {
  logger.debug("Listing available users");

  // 1. Validate input
  const validatedInput = ListAvailableUsersInputSchema.parse(input);

  // 2. Check authentication
  const currentUser = requireAuth();
  
  // 3. Query database
  const dbUsers = await listAvailableUsers(
    validatedInput.currentUserId,
    validatedInput.type ? { type: validatedInput.type } : undefined
  );
  
  // 4. Mapping: SelectUser[] → User[] (without technical fields)
  const apiUsers = dbUsers.map(dbUser => ({
    id: dbUser.id,
    name: dbUser.name,
    avatar: dbUser.avatar,
    type: dbUser.type,
    createdAt: new Date(dbUser.createdAt),
    updatedAt: new Date(dbUser.updatedAt),
  }));
  
  // 5. Validate output
  const result = ListAvailableUsersOutputSchema.parse(apiUsers);
  
  logger.debug("Listed available users", { count: result.length });
  
  return result;
}

declare global {
  namespace WindowAPI {
    interface User {
      listAvailableUsers: (input: ListAvailableUsersInput) => Promise<ListAvailableUsersOutput>
    }
  }
}