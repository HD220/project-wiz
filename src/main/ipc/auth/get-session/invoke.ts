import { z } from "zod";

import {
  initializeSessionFromDatabase,
  getCurrentUserFromCache,
} from "@/main/ipc/auth/queries";

import { getLogger } from "@/shared/services/logger/config";
import { UserSchema } from "@/shared/types";
import {
  createIPCHandler,
  InferHandler,
} from "@/shared/utils/create-ipc-handler";

const logger = getLogger("auth.get-active-session");

const GetActiveSessionInputSchema = z.void();
const GetActiveSessionOutputSchema = z
  .object({
    user: UserSchema,
  })
  .nullable();

const handler = createIPCHandler({
  inputSchema: GetActiveSessionInputSchema,
  outputSchema: GetActiveSessionOutputSchema,
  handler: async () => {
    logger.debug("Getting active session");

    // 1. Initialize session from database if not already loaded (side effect)
    await initializeSessionFromDatabase();

    // 2. Get current user from cache
    const dbUser = getCurrentUserFromCache();

    if (!dbUser) {
      return null;
    }

    // 3. Map to API format (sem campos técnicos)
    const apiUser = {
      id: dbUser.id,
      name: dbUser.name,
      avatar: dbUser.avatar,
      type: dbUser.type,
      createdAt: new Date(dbUser.createdAt),
      updatedAt: new Date(dbUser.updatedAt),
    };

    return { user: apiUser };
  },
});

export default handler;

declare global {
  namespace WindowAPI {
    interface Auth {
      getActiveSession: InferHandler<typeof handler>;
    }
  }
}
