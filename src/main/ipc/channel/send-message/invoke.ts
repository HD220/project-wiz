import { sendChannelMessage } from "@/main/ipc/channel/queries";
import { requireAuth } from "@/main/services/session-registry";

import { getLogger } from "@/shared/services/logger/config";
import { MessageSchema } from "@/shared/types";
import {
  createIPCHandler,
  InferHandler,
} from "@/shared/utils/create-ipc-handler";

const logger = getLogger("channel.send-message.invoke");

const SendChannelMessageInputSchema = MessageSchema.pick({
  sourceId: true,
  content: true,
});

const SendChannelMessageOutputSchema = MessageSchema;

const handler = createIPCHandler({
  inputSchema: SendChannelMessageInputSchema,
  outputSchema: SendChannelMessageOutputSchema,
  handler: async (input) => {
    logger.debug("Sending message to channel", { channelId: input.sourceId });

    const currentUser = requireAuth();

    // Send message to channel
    const messageData = {
      sourceType: "channel" as const,
      sourceId: input.sourceId,
      ownerId: currentUser.id, // Use ownerId for database consistency
      content: input.content,
    };

    const dbMessage = await sendChannelMessage(messageData);

    // Map database result to shared type
    const apiMessage = {
      id: dbMessage.id,
      sourceType: dbMessage.sourceType,
      sourceId: dbMessage.sourceId,
      authorId: dbMessage.ownerId, // Map ownerId to authorId for API consistency
      content: dbMessage.content,
      createdAt: new Date(dbMessage.createdAt),
      updatedAt: new Date(dbMessage.updatedAt),
    };

    logger.debug("Message sent to channel", {
      channelId: input.sourceId,
      messageId: apiMessage.id,
    });

    return apiMessage;
  },
});

export default handler;

declare global {
  namespace WindowAPI {
    interface Channel {
      sendMessage: InferHandler<typeof handler>;
    }
  }
}
