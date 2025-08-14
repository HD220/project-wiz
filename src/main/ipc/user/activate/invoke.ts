import { z } from "zod";

import { activateUser } from "@/main/ipc/user/queries";
import { requireAuth } from "@/main/services/session-registry";

import { emit } from "@/shared/services/events/event-bus";
import { getLogger } from "@/shared/services/logger/config";
import { UserSchema } from "@/shared/types";
import {
  createIPCHandler,
  InferHandler,
} from "@/shared/utils/create-ipc-handler";

const logger = getLogger("user.activate.invoke");

const ActivateUserInputSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
});

const ActivateUserOutputSchema = UserSchema;

const handler = createIPCHandler({
  inputSchema: ActivateUserInputSchema,
  outputSchema: ActivateUserOutputSchema,
  handler: async (input) => {
    logger.debug("Activating user", { userId: input.userId });

    const currentUser = requireAuth();

    // Execute query
    const dbUser = await activateUser(input.userId);

    if (!dbUser) {
      throw new Error("User not found or cannot be activated");
    }

    // Map database result to API format
    const apiUser = {
      id: dbUser.id,
      name: dbUser.name,
      avatar: dbUser.avatar,
      type: dbUser.type,
      createdAt: new Date(dbUser.createdAt),
      updatedAt: new Date(dbUser.updatedAt),
    };

    logger.debug("User activated", { userId: apiUser.id });

    // Emit event
    emit("user:activated", {
      userId: apiUser.id,
      activatedBy: currentUser.id,
    });

    return apiUser;
  },
});

export default handler;

declare global {
  namespace WindowAPI {
    interface User {
      activate: InferHandler<typeof handler>;
    }
  }
}
