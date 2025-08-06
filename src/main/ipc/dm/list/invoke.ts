import { z } from "zod";
import { listUserDMConversations } from "@/main/ipc/dm/queries";
import { DMConversationSchema } from "@/shared/types/dm-conversation";
import { requireAuth } from "@/main/services/session-registry";
import { getLogger } from "@/shared/services/logger/config";
import { eventBus } from "@/shared/services/events/event-bus";

const logger = getLogger("dm.list.invoke");

// Input schema - campos opcionais
const ListDMConversationsInputSchema = z.object({
  includeInactive: z.boolean().optional().default(false),
  includeArchived: z.boolean().optional().default(false),
});

// Output schema - array de conversations with participants and lastMessage
const ListDMConversationsOutputSchema = z.array(DMConversationSchema.extend({
  isActive: z.boolean(),
  deactivatedAt: z.date().nullable(),
  deactivatedBy: z.string().nullable(),
  participants: z.array(z.object({
    id: z.string(),
    ownerId: z.string(),
    dmConversationId: z.string(),
    participantId: z.string(),
    isActive: z.boolean(),
    deactivatedAt: z.date().nullable(),
    deactivatedBy: z.string().nullable(),
    createdAt: z.date(),
    updatedAt: z.date(),
  })),
  lastMessage: z.object({
    id: z.string(),
    content: z.string(),
    authorId: z.string(),
    createdAt: z.number(),
    updatedAt: z.number(),
  }).optional(),
}));

type ListDMConversationsInput = z.infer<typeof ListDMConversationsInputSchema>;
type ListDMConversationsOutput = z.infer<typeof ListDMConversationsOutputSchema>;

export default async function(filters: ListDMConversationsInput = { includeInactive: false, includeArchived: false }): Promise<ListDMConversationsOutput> {
  logger.debug("Getting user DM conversations", { filters });

  // 1. Validate input
  const validatedFilters = ListDMConversationsInputSchema.parse(filters);

  // 2. Check authentication
  const currentUser = requireAuth();
  
  // 3. Execute query with ownership validation
  const dbConversations = await listUserDMConversations({
    ownerId: currentUser.id,
    includeInactive: validatedFilters.includeInactive,
    includeArchived: validatedFilters.includeArchived,
  });
  
  // 4. Map database result to API format
  const apiConversations = dbConversations.map(conversation => ({
    id: conversation.id,
    name: conversation.name,
    description: conversation.description,
    archivedAt: conversation.archivedAt ? new Date(conversation.archivedAt) : null,
    archivedBy: conversation.archivedBy,
    createdAt: new Date(conversation.createdAt),
    updatedAt: new Date(conversation.updatedAt),
    isActive: conversation.isActive,
    deactivatedAt: conversation.deactivatedAt ? new Date(conversation.deactivatedAt) : null,
    deactivatedBy: conversation.deactivatedBy,
    participants: conversation.participants.map(participant => ({
      id: participant.id,
      ownerId: participant.ownerId,
      dmConversationId: participant.dmConversationId,
      participantId: participant.participantId,
      isActive: participant.isActive,
      deactivatedAt: participant.deactivatedAt ? new Date(participant.deactivatedAt) : null,
      deactivatedBy: participant.deactivatedBy,
      createdAt: new Date(participant.createdAt),
      updatedAt: new Date(participant.updatedAt),
    })),
    lastMessage: conversation.lastMessage,
  }));
  
  logger.debug("Retrieved user DM conversations", { count: apiConversations.length, ownerId: currentUser.id });
  
  // 5. Emit event
  eventBus.emit("dm:list", { ownerId: currentUser.id, conversationCount: apiConversations.length });
  
  // 6. Validate and return output
  return ListDMConversationsOutputSchema.parse(apiConversations);
}

declare global {
  namespace WindowAPI {
    interface Dm {
      list: (options?: ListDMConversationsInput) => Promise<ListDMConversationsOutput>
    }
  }
}
