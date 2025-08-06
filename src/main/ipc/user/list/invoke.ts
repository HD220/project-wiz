import { z } from "zod";
import { listUsers } from "@/main/ipc/user/queries";
import { UserSchema } from "@/shared/types";
import { requireAuth } from "@/main/services/session-registry";
import { getLogger } from "@/shared/services/logger/config";
import { createIPCHandler, InferHandler } from "@/shared/utils/create-ipc-handler";

const logger = getLogger("user.list-all-users.invoke");

const ListAllUsersInputSchema = z.object({
  includeInactive: z.boolean().optional().default(false)
});

const ListAllUsersOutputSchema = z.array(UserSchema);

const handler = createIPCHandler({
  inputSchema: ListAllUsersInputSchema,
  outputSchema: ListAllUsersOutputSchema,
  handler: async (input) => {
    logger.debug("Listing all users");

    requireAuth();
    
    // Query recebe dados e gerencia campos técnicos internamente
    const dbUsers = await listUsers({ includeInactive: input.includeInactive });
    
    // Mapeamento: SelectUser[] → User[] (sem campos técnicos)
    const apiUsers = dbUsers.map(user => ({
      id: user.id,
      name: user.name,
      avatar: user.avatar,
      type: user.type,
      createdAt: new Date(user.createdAt),
      updatedAt: new Date(user.updatedAt),
    }));
    
    logger.debug("All users listed", { userCount: apiUsers.length });
    
    return apiUsers;
  }
});

export default handler;

declare global {
  namespace WindowAPI {
    interface User {
      list: InferHandler<typeof handler>
    }
  }
}