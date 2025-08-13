import { z } from "zod";

import { listAvailableUsers } from "@/main/ipc/user/queries";
import { requireAuth } from "@/main/services/session-registry";

import { getLogger } from "@/shared/services/logger/config";
import { UserSchema } from "@/shared/types";
import {
  createIPCHandler,
  InferHandler,
} from "@/shared/utils/create-ipc-handler";

const logger = getLogger("user.list-available-users.invoke");

const ListAvailableUsersInputSchema = z.object({});

const ListAvailableUsersOutputSchema = z.array(UserSchema);

const handler = createIPCHandler({
  inputSchema: ListAvailableUsersInputSchema,
  outputSchema: ListAvailableUsersOutputSchema,
  handler: async () => {
    logger.debug("Listing available users");

    const currentUser = requireAuth();

    // Query database
    const dbUsers = await listAvailableUsers(currentUser.id);

    // Mapping: SelectUser[] → User[] (without technical fields)
    const apiUsers = dbUsers.map((dbUser) => ({
      id: dbUser.id,
      name: dbUser.name,
      avatar: dbUser.avatar,
      type: dbUser.type,
      status: dbUser.status,
      createdAt: new Date(dbUser.createdAt),
      updatedAt: new Date(dbUser.updatedAt),
    }));

    logger.debug("Listed available users", { count: apiUsers.length });

    return apiUsers;
  },
});

export default handler;

declare global {
  namespace WindowAPI {
    interface User {
      listAvailableUsers: InferHandler<typeof handler>;
    }
  }
}
