import { z } from "zod";

import { authenticateUser } from "@/main/ipc/auth/queries";
import { sessionRegistry } from "@/main/services/session-registry";

import { eventBus } from "@/shared/services/events/event-bus";
import { getLogger } from "@/shared/services/logger/config";
import { UserSchema } from "@/shared/types";
import {
  createIPCHandler,
  InferHandler,
} from "@/shared/utils/create-ipc-handler";

const logger = getLogger("auth.login");

const LoginInputSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

const LoginOutputSchema = z.object({
  user: UserSchema,
  token: z.string(),
});

const handler = createIPCHandler({
  inputSchema: LoginInputSchema,
  outputSchema: LoginOutputSchema,
  handler: async (input) => {
    logger.info("Authenticating user", { username: input.username });

    // 1. Query recebe dados e gerencia campos técnicos internamente
    const dbResult = await authenticateUser(input);

    // 2. Usar dbResult.user diretamente - já é AuthenticatedUser (SelectUser)
    const authenticatedUser = dbResult.user;

    // 3. Set session in registry (with proper expiry)
    sessionRegistry.setSession(
      authenticatedUser,
      dbResult.sessionToken,
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    );

    // 4. Mapeamento: AuthenticatedUser → User (API clean type)
    const apiUser = {
      id: authenticatedUser.id,
      name: authenticatedUser.name,
      avatar: authenticatedUser.avatar,
      type: authenticatedUser.type,
      createdAt: new Date(authenticatedUser.createdAt),
      updatedAt: new Date(authenticatedUser.updatedAt),
    };

    // 5. Prepare API response
    const result = {
      user: apiUser,
      token: dbResult.sessionToken,
    };

    // 6. Emit user login event
    eventBus.emit("user:logged-in", {
      userId: result.user.id,
      username: result.user.name,
      timestamp: new Date(),
    });

    logger.info("User authenticated successfully", {
      userId: result.user.id,
      username: input.username,
    });

    return result;
  },
});

export default handler;

declare global {
  namespace WindowAPI {
    interface Auth {
      login: InferHandler<typeof handler>;
    }
  }
}
