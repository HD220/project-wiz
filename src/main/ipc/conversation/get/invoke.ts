import { z } from "zod";

import { findDMConversation, getDMMessages } from "@/main/ipc/dm/queries";
import { findProjectChannel } from "@/main/ipc/channel/queries";
import { requireAuth } from "@/main/services/session-registry";

import { getLogger } from "@/shared/services/logger/config";
import { MessageSchema } from "@/shared/types";
import {
  createIPCHandler,
  InferHandler,
} from "@/shared/utils/create-ipc-handler";

const logger = getLogger("conversation.get.invoke");

const GetConversationInputSchema = z.object({
  conversationId: z.string().min(1, "Conversation ID is required"),
  sourceType: z.enum(["dm", "channel"]).optional().default("dm"),
});

const GetConversationOutputSchema = z.object({
  id: z.string(),
  name: z.string().nullable(),
  description: z.string().nullable(),
  sourceType: z.enum(["dm", "channel"]),
  messages: z.array(MessageSchema),
  participants: z.array(z.object({
    id: z.string(),
    name: z.string(),
    avatar: z.string().nullable(),
  })),
  createdAt: z.date(),
  updatedAt: z.date(),
});

const handler = createIPCHandler({
  inputSchema: GetConversationInputSchema,
  outputSchema: GetConversationOutputSchema,
  handler: async (input) => {
    logger.debug("Getting conversation", {
      conversationId: input.conversationId,
    });

    const currentUser = requireAuth();

    if (input.sourceType === "dm") {
      // Handle Direct Message conversations
      const dmConversation = await findDMConversation(input.conversationId, currentUser.id);
      
      if (!dmConversation) {
        throw new Error("Direct message conversation not found");
      }

      // Get messages for this DM
      const messages = await getDMMessages(input.conversationId, { ownerId: currentUser.id });

      return {
        id: dmConversation.id,
        name: dmConversation.name,
        description: dmConversation.description,
        sourceType: "dm" as const,
        messages: messages || [],
        participants: dmConversation.participants?.map(p => ({
          id: p.participantId,
          name: p.participant?.name || "Unknown",
          avatar: p.participant?.avatar || null,
        })) || [],
        createdAt: dmConversation.createdAt,
        updatedAt: dmConversation.updatedAt,
      };
    } else {
      // Handle Channel conversations
      const channel = await findProjectChannel(input.conversationId, currentUser.id);
      
      if (!channel) {
        throw new Error("Channel not found");
      }

      // Get messages for this channel (TODO: implement specific channel message query)
      const messages = []; // Temporary - will implement when channel queries are updated

      // For channels, participants are project members (handled by channel query)
      return {
        id: channel.id,
        name: channel.name,
        description: channel.description,
        sourceType: "channel" as const,
        messages: messages || [],
        participants: [], // TODO: Get project members when channel queries are updated
        createdAt: channel.createdAt,
        updatedAt: channel.updatedAt,
      };
    }

  },
});

export default handler;

declare global {
  namespace WindowAPI {
    interface Conversation {
      get: InferHandler<typeof handler>;
    }
  }
}