import { z } from "zod";
import { getAllUsers } from "./queries";
import { UserSchema } from "@/shared/types";
import { requireAuth } from "@/main/services/session-registry";
import { getLogger } from "@/shared/logger/config";

const logger = getLogger("user.list-all-users.invoke");

// Input schema - campos necessários para filtro
const ListAllUsersInputSchema = z.object({
  includeInactive: z.boolean().optional().default(false)
});

// Output schema - array de User
const ListAllUsersOutputSchema = z.array(UserSchema);

type ListAllUsersInput = z.infer<typeof ListAllUsersInputSchema>;
type ListAllUsersOutput = z.infer<typeof ListAllUsersOutputSchema>;

export default async function(input: ListAllUsersInput): Promise<ListAllUsersOutput> {
  logger.debug("Listing all users");

  // 1. Validate input
  const validatedInput = ListAllUsersInputSchema.parse(input);

  // 2. Check authentication  
  const currentUser = requireAuth();
  
  // 3. Query recebe dados e gerencia campos técnicos internamente
  const dbUsers = await getAllUsers(validatedInput.includeInactive);
  
  // 4. Mapeamento: SelectUser[] → User[] (sem campos técnicos)
  const apiUsers = dbUsers.map(user => ({
    id: user.id,
    name: user.name,
    avatar: user.avatar,
    type: user.type,
    createdAt: new Date(user.createdAt),
    updatedAt: new Date(user.updatedAt),
  }));
  
  // 5. Validate output
  const result = ListAllUsersOutputSchema.parse(apiUsers);
  
  logger.debug("All users listed", { userCount: result.length });
  
  return result;
}

declare global {
  namespace WindowAPI {
    interface User {
      listAllUsers: (input: ListAllUsersInput) => Promise<ListAllUsersOutput>
    }
  }
}