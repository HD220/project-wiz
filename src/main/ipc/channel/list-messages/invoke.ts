import { z } from "zod";

import { getChannelMessages } from "@/main/ipc/channel/queries";
import { requireAuth } from "@/main/services/session-registry";

import { emit } from "@/shared/services/events/event-bus";
import { getLogger } from "@/shared/services/logger/config";
import { MessageSchema } from "@/shared/types";
import {
  createIPCHandler,
  InferHandler,
} from "@/shared/utils/create-ipc-handler";

const logger = getLogger("channel.list-messages.invoke");

const ListChannelMessagesInputSchema = z.object({
  channelId: z.string().min(1, "Channel ID is required"),
});

const ListChannelMessagesOutputSchema = z.array(MessageSchema);

const handler = createIPCHandler({
  inputSchema: ListChannelMessagesInputSchema,
  outputSchema: ListChannelMessagesOutputSchema,
  handler: async (input) => {
    logger.debug("Getting channel messages", { channelId: input.channelId });

    requireAuth();

    // Get messages from channel
    const dbMessages = await getChannelMessages(input.channelId);

    // Mapeamento: SelectMessage[] → Message[] (dados puros da entidade)
    const apiMessages = dbMessages.map((message) => ({
      id: message.id,
      sourceType: message.sourceType as "channel",
      sourceId: message.sourceId,
      authorId: message.ownerId, // Map ownerId to authorId for API consistency
      content: message.content,
      createdAt: new Date(message.createdAt),
      updatedAt: new Date(message.updatedAt),
    }));

    logger.debug("Channel messages retrieved", {
      channelId: input.channelId,
      messageCount: apiMessages.length,
    });

    // Emit event
    emit("channel:list-messages", {
      channelId: input.channelId,
      messageCount: apiMessages.length,
    });

    return apiMessages;
  },
});

export default handler;

declare global {
  namespace WindowAPI {
    interface Channel {
      listMessages: InferHandler<typeof handler>;
    }
  }
}
