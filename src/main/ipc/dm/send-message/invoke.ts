import { z } from "zod";

import { sendDMMessage } from "@/main/ipc/dm/queries";
import { requireAuth } from "@/main/services/session-registry";

import { emit } from "@/shared/services/events/event-bus";
import { getLogger } from "@/shared/services/logger/config";
import { MessageSchema } from "@/shared/types";
import {
  createIPCHandler,
  InferHandler,
} from "@/shared/utils/create-ipc-handler";

const logger = getLogger("dm.send-message.invoke");

const SendDMMessageInputSchema = z.object({
  dmId: z.string().min(1, "DM ID is required"),
  content: z.string().min(1, "Content is required"),
});

const SendDMMessageOutputSchema = MessageSchema;

const handler = createIPCHandler({
  inputSchema: SendDMMessageInputSchema,
  outputSchema: SendDMMessageOutputSchema,
  handler: async (input) => {
    logger.debug("Sending message to DM", {
      dmId: input.dmId,
      contentLength: input.content.length,
    });

    const currentUser = requireAuth();

    // Send message to DM conversation
    const dbMessage = await sendDMMessage({
      authorId: currentUser.id,
      sourceType: "dm",
      sourceId: input.dmId,
      content: input.content,
    });

    // Mapeamento: SelectMessage → Message (dados puros da entidade)
    const apiMessage = {
      id: dbMessage.id,
      sourceType: dbMessage.sourceType,
      sourceId: dbMessage.sourceId,
      authorId: dbMessage.authorId, // Now we have proper authorId field
      content: dbMessage.content,
      createdAt: new Date(dbMessage.createdAt),
      updatedAt: new Date(dbMessage.updatedAt),
    };

    logger.debug("Message sent to DM", {
      messageId: apiMessage.id,
      sourceId: apiMessage.sourceId,
    });

    // Emit specific event for this operation
    emit("dm:message-sent", {
      messageId: apiMessage.id,
      sourceId: apiMessage.sourceId,
    });

    return apiMessage;
  },
});

export default handler;

declare global {
  namespace WindowAPI {
    interface Dm {
      sendMessage: InferHandler<typeof handler>;
    }
  }
}
