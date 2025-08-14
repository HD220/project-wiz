import { z } from "zod";

import { updateUser } from "@/main/ipc/user/queries";
import { requireAuth } from "@/main/services/session-registry";

import { emit } from "@/shared/services/events/event-bus";
import { getLogger } from "@/shared/services/logger/config";
import { UserSchema } from "@/shared/types";
import {
  createIPCHandler,
  InferHandler,
} from "@/shared/utils/create-ipc-handler";

const logger = getLogger("user.update.invoke");

const UpdateUserInputSchema = UserSchema.pick({
  name: true,
  avatar: true,
})
  .partial()
  .extend({
    id: z.string(),
  });

const UpdateUserOutputSchema = UserSchema;

const handler = createIPCHandler({
  inputSchema: UpdateUserInputSchema,
  outputSchema: UpdateUserOutputSchema,
  handler: async (input) => {
    logger.debug("Updating user", { userId: input.id });

    // Validate user authentication
    requireAuth();

    // Extract id and prepare update data
    const { id, ...updateData } = input;

    // Query recebe dados separados
    const dbUser = await updateUser(id, updateData);

    if (!dbUser) {
      throw new Error("User not found, inactive, or update failed");
    }

    // Mapeamento: SelectUser → User (sem campos técnicos)
    const apiUser = {
      id: dbUser.id,
      name: dbUser.name,
      avatar: dbUser.avatar,
      type: dbUser.type,
      createdAt: new Date(dbUser.createdAt),
      updatedAt: new Date(dbUser.updatedAt),
    };

    logger.debug("User updated", {
      userId: apiUser.id,
      name: apiUser.name,
    });

    // Emit specific event for update
    emit("user:updated", { userId: apiUser.id });

    return apiUser;
  },
});

export default handler;

declare global {
  namespace WindowAPI {
    interface User {
      update: InferHandler<typeof handler>;
    }
  }
}
