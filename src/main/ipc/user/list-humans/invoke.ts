import { z } from "zod";

import { getUsersByType } from "@/main/ipc/user/queries";
import { requireAuth } from "@/main/services/session-registry";

import { getLogger } from "@/shared/services/logger/config";
import { UserSchema } from "@/shared/types";
import {
  createIPCHandler,
  InferHandler,
} from "@/shared/utils/create-ipc-handler";

const logger = getLogger("user.list-humans.invoke");

const ListHumansInputSchema = z
  .object({
    showInactive: z.boolean().optional(),
  })
  .optional();

const ListHumansOutputSchema = z.array(UserSchema);

const handler = createIPCHandler({
  inputSchema: ListHumansInputSchema,
  outputSchema: ListHumansOutputSchema,
  handler: async (input) => {
    logger.debug("Listing human users", { showInactive: input?.showInactive });

    requireAuth();

    // Execute core business logic
    const users = await getUsersByType("human", input?.showInactive);

    // Map to clean domain objects (removing technical fields)
    const result = users.map((user) => ({
      id: user.id,
      name: user.name,
      avatar: user.avatar,
      type: user.type,
      createdAt: new Date(user.createdAt),
      updatedAt: new Date(user.updatedAt),
    }));

    logger.debug("Human users listed", {
      userCount: result.length,
      showInactive: input?.showInactive,
    });

    return result;
  },
});

export default handler;

declare global {
  namespace WindowAPI {
    interface User {
      listHumans: InferHandler<typeof handler>;
    }
  }
}
