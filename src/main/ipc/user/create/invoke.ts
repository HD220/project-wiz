import { z } from "zod";

import {
  createUserAccount,
  checkUsernameExists,
} from "@/main/ipc/auth/queries";

import { emit } from "@/shared/services/events/event-bus";
import { getLogger } from "@/shared/services/logger/config";
import { UserSchema } from "@/shared/types";
import {
  createIPCHandler,
  InferHandler,
} from "@/shared/utils/create-ipc-handler";

const logger = getLogger("user.create.invoke");

const CreateUserInputSchema = z.object({
  name: z.string().min(1),
  username: z.string().min(1),
  password: z.string().min(6),
});

const CreateUserOutputSchema = z.object({
  user: UserSchema,
  token: z.string(),
});

const handler = createIPCHandler({
  inputSchema: CreateUserInputSchema,
  outputSchema: CreateUserOutputSchema,
  handler: async (input) => {
    logger.debug("Creating user account", {
      userName: input.name,
      username: input.username,
    });

    // Check if username already exists
    const usernameExists = await checkUsernameExists(input.username);
    if (usernameExists) {
      throw new Error("Username already exists");
    }

    // Create user account with authentication
    const result = await createUserAccount({
      name: input.name,
      username: input.username,
      password: input.password,
    });

    // Mapeamento: SelectUser → User (API clean type)
    const apiUser = {
      id: result.user.id,
      name: result.user.name,
      avatar: result.user.avatar,
      type: result.user.type,
      status: result.user.status,
      createdAt: new Date(result.user.createdAt),
      updatedAt: new Date(result.user.updatedAt),
    };

    logger.debug("User account created", {
      userId: apiUser.id,
      name: apiUser.name,
      username: input.username,
    });

    // Emit specific event for creation
    emit("user:created", { userId: apiUser.id, type: apiUser.type });

    return {
      user: apiUser,
      token: result.sessionToken,
    };
  },
});

export default handler;

declare global {
  namespace WindowAPI {
    interface User {
      create: InferHandler<typeof handler>;
    }
  }
}
