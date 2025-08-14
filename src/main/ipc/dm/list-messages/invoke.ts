import { z } from "zod";

import { getDMMessages } from "@/main/ipc/dm/queries";
import { requireAuth } from "@/main/services/session-registry";

import { emit } from "@/shared/services/events/event-bus";
import { getLogger } from "@/shared/services/logger/config";
import { MessageSchema } from "@/shared/types";
import {
  createIPCHandler,
  InferHandler,
} from "@/shared/utils/create-ipc-handler";

const logger = getLogger("dm.list-messages.invoke");

const ListDMMessagesInputSchema = z.object({
  dmId: z.string().min(1, "DM ID is required"),
});

const ListDMMessagesOutputSchema = z.array(MessageSchema);

const handler = createIPCHandler({
  inputSchema: ListDMMessagesInputSchema,
  outputSchema: ListDMMessagesOutputSchema,
  handler: async (input) => {
    logger.debug("Getting DM messages", { dmId: input.dmId });

    // Validate user authentication
    requireAuth();

    // Get messages from DM conversation
    const dbMessages = await getDMMessages(input.dmId);

    // Mapeamento: SelectMessage[] → Message[] (dados puros da entidade)
    const apiMessages = dbMessages.map((message) => ({
      id: message.id,
      sourceType: message.sourceType,
      sourceId: message.sourceId,
      authorId: message.ownerId, // Map ownerId to authorId for API consistency
      content: message.content,
      createdAt: new Date(message.createdAt),
      updatedAt: new Date(message.updatedAt),
    }));

    logger.debug("Retrieved DM messages", {
      count: apiMessages.length,
      dmId: input.dmId,
    });

    // Emit event
    emit("dm:list-messages", {
      dmId: input.dmId,
      messageCount: apiMessages.length,
    });

    return apiMessages;
  },
});

export default handler;

declare global {
  namespace WindowAPI {
    interface Dm {
      listMessages: InferHandler<typeof handler>;
    }
  }
}
