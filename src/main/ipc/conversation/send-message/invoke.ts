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

const logger = getLogger("conversation.send-message.invoke");

const SendConversationMessageInputSchema = z.object({
  conversationId: z.string().min(1, "Conversation ID is required"),
  content: z.string().min(1, "Content is required"),
  sourceType: z.enum(["dm", "channel"]).optional().default("dm"),
});

const SendConversationMessageOutputSchema = MessageSchema;

const handler = createIPCHandler({
  inputSchema: SendConversationMessageInputSchema,
  outputSchema: SendConversationMessageOutputSchema,
  handler: async (input) => {
    logger.debug("Sending message to conversation", {
      conversationId: input.conversationId,
      contentLength: input.content.length,
    });

    const currentUser = requireAuth();

    // Send message to conversation 
    // For now, using sendDMMessage for both - will be refactored when universal message sending is implemented
    const dbMessage = await sendDMMessage({
      authorId: currentUser.id,
      sourceType: input.sourceType,
      sourceId: input.conversationId,
      content: input.content,
    });

    // Map database message to API format
    const apiMessage = {
      id: dbMessage.id,
      sourceType: dbMessage.sourceType,
      sourceId: dbMessage.sourceId,
      authorId: dbMessage.authorId,
      content: dbMessage.content,
      createdAt: new Date(dbMessage.createdAt),
      updatedAt: new Date(dbMessage.updatedAt),
    };

    logger.debug("Message sent to conversation", {
      messageId: apiMessage.id,
      conversationId: input.conversationId,
    });

    // Emit reactive event - event listeners will handle agent responses
    emit("event:messages", {
      action: "sent",
      key: input.conversationId,
      messageId: apiMessage.id,
      authorId: currentUser.id,
    });

    return apiMessage;
  },
});

export default handler;

declare global {
  namespace WindowAPI {
    interface Conversation {
      sendMessage: InferHandler<typeof handler>;
    }
  }
}