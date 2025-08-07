import { z } from "zod";

import { unarchiveDMConversation } from "@/main/ipc/dm/queries";
import { requireAuth } from "@/main/services/session-registry";

import { eventBus } from "@/shared/services/events/event-bus";
import { getLogger } from "@/shared/services/logger/config";
import {
  createIPCHandler,
  InferHandler,
} from "@/shared/utils/create-ipc-handler";

const logger = getLogger("dm.unarchive.invoke");

const UnarchiveDMInputSchema = z.object({
  dmId: z.string().min(1, "DM ID is required"),
});

const UnarchiveDMOutputSchema = z.void();

const handler = createIPCHandler({
  inputSchema: UnarchiveDMInputSchema,
  outputSchema: UnarchiveDMOutputSchema,
  handler: async (input) => {
    logger.debug("Unarchiving DM conversation", { dmId: input.dmId });

    const currentUser = requireAuth();

    // Execute query with ownership validation
    const dbConversation = await unarchiveDMConversation({
      ownerId: currentUser.id,
      id: input.dmId,
    });

    if (!dbConversation) {
      throw new Error("DM conversation not found or access denied");
    }

    logger.debug("DM conversation unarchived", { dmId: input.dmId });

    // Emit event
    eventBus.emit("dm:unarchived", { dmId: input.dmId });
  },
});

export default handler;

declare global {
  namespace WindowAPI {
    interface Dm {
      unarchive: InferHandler<typeof handler>;
    }
  }
}
