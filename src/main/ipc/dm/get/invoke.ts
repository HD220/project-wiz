import { z } from "zod";

import { findDMConversation } from "@/main/ipc/dm/queries";
import { requireAuth } from "@/main/services/session-registry";

import { eventBus } from "@/shared/services/events/event-bus";
import { getLogger } from "@/shared/services/logger/config";
import { DMConversationSchema } from "@/shared/types/dm-conversation";
import {
  createIPCHandler,
  InferHandler,
} from "@/shared/utils/create-ipc-handler";

const logger = getLogger("dm.get.invoke");

const GetDMInputSchema = z.object({
  dmId: z.string().min(1, "DM ID is required"),
});

const GetDMOutputSchema = DMConversationSchema.extend({
  isActive: z.boolean(),
  deactivatedAt: z.date().nullable(),
}).nullable();

const handler = createIPCHandler({
  inputSchema: GetDMInputSchema,
  outputSchema: GetDMOutputSchema,
  handler: async (input) => {
    logger.debug("Getting DM by ID", { dmId: input.dmId });

    const currentUser = requireAuth();

    // Find DM conversation with ownership validation
    const dbConversation = await findDMConversation(input.dmId, currentUser.id);

    // Map to API format
    const result = dbConversation
      ? {
          id: dbConversation.id!,
          name: dbConversation.name,
          description: dbConversation.description,
          archivedAt: dbConversation.archivedAt,
          createdAt: dbConversation.createdAt,
          updatedAt: dbConversation.updatedAt,
          isActive: !dbConversation.deactivatedAt,
          deactivatedAt: dbConversation.deactivatedAt
            ? new Date(dbConversation.deactivatedAt)
            : null,
        }
      : null;

    logger.debug("DM found", { found: !!result, dmId: input.dmId });

    // Emit event
    eventBus.emit("dm:get", { dmId: input.dmId, found: !!result });

    return result;
  },
});

export default handler;

declare global {
  namespace WindowAPI {
    interface Dm {
      get: InferHandler<typeof handler>;
    }
  }
}
