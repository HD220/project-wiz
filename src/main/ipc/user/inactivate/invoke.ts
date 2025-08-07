import { z } from "zod";

import { softDeleteUser } from "@/main/ipc/user/queries";
import { requireAuth } from "@/main/services/session-registry";

import { eventBus } from "@/shared/services/events/event-bus";
import { getLogger } from "@/shared/services/logger/config";
import {
  createIPCHandler,
  InferHandler,
} from "@/shared/utils/create-ipc-handler";

const logger = getLogger("user.soft-delete.invoke");

const SoftDeleteUserInputSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
});

const SoftDeleteUserOutputSchema = z.void();

const handler = createIPCHandler({
  inputSchema: SoftDeleteUserInputSchema,
  outputSchema: SoftDeleteUserOutputSchema,
  handler: async (input) => {
    logger.debug("Soft deleting user", { userId: input.userId });

    requireAuth();

    // Execute core business logic
    const success = await softDeleteUser(input.userId);

    if (!success) {
      throw new Error("Failed to soft delete user");
    }

    logger.debug("User soft deleted", { userId: input.userId });

    // Emit specific event for deletion
    eventBus.emit("user:deleted", { userId: input.userId });

    return undefined;
  },
});

export default handler;

declare global {
  namespace WindowAPI {
    interface User {
      inactivate: InferHandler<typeof handler>;
    }
  }
}
