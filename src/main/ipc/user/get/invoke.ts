import { z } from "zod";

import { findUser } from "@/main/ipc/user/queries";
import { requireAuth } from "@/main/services/session-registry";

import { getLogger } from "@/shared/services/logger/config";
import { UserSchema } from "@/shared/types";
import {
  createIPCHandler,
  InferHandler,
} from "@/shared/utils/create-ipc-handler";

const logger = getLogger("user.find-by-id.invoke");

const FindUserByIdInputSchema = z.object({
  userId: z.string(),
  includeInactive: z.boolean().default(false),
});

const FindUserByIdOutputSchema = UserSchema.nullable();

const handler = createIPCHandler({
  inputSchema: FindUserByIdInputSchema,
  outputSchema: FindUserByIdOutputSchema,
  handler: async (input) => {
    logger.debug("Finding user by ID");

    requireAuth();

    // Query recebe dados e gerencia campos técnicos internamente
    const dbUser = await findUser(input.userId, input.includeInactive);

    // Mapeamento: SelectUser → User (sem campos técnicos)
    const apiUser = dbUser
      ? {
          id: dbUser.id,
          name: dbUser.name,
          avatar: dbUser.avatar,
          type: dbUser.type,
          createdAt: new Date(dbUser.createdAt),
          updatedAt: new Date(dbUser.updatedAt),
        }
      : null;

    logger.debug("User find by ID result", { found: apiUser !== null });

    return apiUser;
  },
});

export default handler;

declare global {
  namespace WindowAPI {
    interface User {
      get: InferHandler<typeof handler>;
    }
  }
}
