import { z } from "zod";

import { listUserDMConversations } from "@/main/ipc/dm/queries";
import { requireAuth } from "@/main/services/session-registry";

import { emit } from "@/shared/services/events/event-bus";
import { getLogger } from "@/shared/services/logger/config";
import { DMConversationSchema } from "@/shared/types/direct-message";
import {
  createIPCHandler,
  InferHandler,
} from "@/shared/utils/create-ipc-handler";

const logger = getLogger("dm.list.invoke");

const ListDMConversationsInputSchema = z
  .object({
    includeInactive: z.boolean().optional().default(false),
    includeArchived: z.boolean().optional().default(false),
  })
  .optional()
  .default({});

const ListDMConversationsOutputSchema = z.array(
  DMConversationSchema.extend({
    isActive: z.boolean(),
    isArchived: z.boolean(),
    deactivatedAt: z.date().nullable(),
    participants: z.array(
      z.object({
        id: z.string(),
        ownerId: z.string(),
        directMessageId: z.string(),
        participantId: z.string(),
        isActive: z.boolean(),
        deactivatedAt: z.date().nullable(),
        createdAt: z.date(),
        updatedAt: z.date(),
      }),
    ),
    lastMessage: z
      .object({
        id: z.string(),
        content: z.string(),
        authorId: z.string(),
        createdAt: z.number(),
        updatedAt: z.number(),
      })
      .optional(),
  }),
);

const handler = createIPCHandler({
  inputSchema: ListDMConversationsInputSchema,
  outputSchema: ListDMConversationsOutputSchema,
  handler: async (filters = {}) => {
    logger.debug("Getting user DM conversations", { filters });

    const currentUser = requireAuth();

    // Execute query with ownership validation
    const dbConversations = await listUserDMConversations({
      ownerId: currentUser.id,
      includeInactive: filters.includeInactive || false,
      includeArchived: filters.includeArchived || false,
    });

    // Map database result to API format
    const apiConversations = dbConversations.map((conversation) => ({
      id: conversation.id,
      name: conversation.name,
      description: conversation.description,
      isArchived: !!conversation.archivedAt,
      archivedAt: conversation.archivedAt
        ? new Date(conversation.archivedAt)
        : null,
      createdAt: new Date(conversation.createdAt),
      updatedAt: new Date(conversation.updatedAt),
      isActive: !conversation.deactivatedAt,
      deactivatedAt: conversation.deactivatedAt
        ? new Date(conversation.deactivatedAt)
        : null,
      participants: conversation.participants.map((participant) => ({
        id: participant.id,
        ownerId: participant.ownerId,
        directMessageId: participant.directMessageId,
        participantId: participant.participantId,
        isActive: !participant.deactivatedAt,
        deactivatedAt: participant.deactivatedAt
          ? new Date(participant.deactivatedAt)
          : null,
        createdAt: new Date(participant.createdAt),
        updatedAt: new Date(participant.updatedAt),
      })),
      lastMessage: conversation.lastMessage,
    }));

    logger.debug("Retrieved user DM conversations", {
      count: apiConversations.length,
      ownerId: currentUser.id,
    });

    // Emit event
    emit("dm:list", {
      ownerId: currentUser.id,
      conversationCount: apiConversations.length,
    });

    return apiConversations;
  },
});

export default handler;

declare global {
  namespace WindowAPI {
    interface Dm {
      list: InferHandler<typeof handler>;
    }
  }
}
