import { z } from "zod";
import { createDMConversation } from "@/main/ipc/dm/queries";
import { DMConversationSchema } from "@/shared/types";
import { requireAuth } from "@/main/services/session-registry";
import { getLogger } from "@/shared/services/logger/config";
import { eventBus } from "@/shared/services/events/event-bus";
import { createIPCHandler, InferHandler } from "@/shared/utils/create-ipc-handler";

const logger = getLogger("dm.create.invoke");

const CreateDMInputSchema = z.object({
  participantIds: z.array(z.string()).min(1, "At least one participant is required"),
});

const CreateDMOutputSchema = DMConversationSchema;

const handler = createIPCHandler({
  inputSchema: CreateDMInputSchema,
  outputSchema: CreateDMOutputSchema,
  handler: async (input) => {
    logger.debug("Creating DM conversation", { participantCount: input.participantIds.length });

    const currentUser = requireAuth();
    
    // Create DM conversation with participants
    const dbDMConversation = await createDMConversation({
      ownerId: currentUser.id,
      description: null, // Auto-generated, no user input needed
      participantIds: input.participantIds,
      currentUserId: currentUser.id
    });
    
    // Mapeamento: SelectDMConversation → DMConversation (dados puros da entidade)
    const apiDMConversation = {
      id: dbDMConversation.id,
      name: dbDMConversation.name,
      description: dbDMConversation.description,
      archivedAt: dbDMConversation.archivedAt ? new Date(dbDMConversation.archivedAt) : null,
      archivedBy: dbDMConversation.archivedBy,
      createdAt: new Date(dbDMConversation.createdAt),
      updatedAt: new Date(dbDMConversation.updatedAt),
    };
    
    logger.debug("DM conversation created", { dmId: apiDMConversation.id, name: apiDMConversation.name });
    
    // Emit event
    eventBus.emit("dm:created", { dmId: apiDMConversation.id });
    
    return apiDMConversation;
  }
});

export default handler;

declare global {
  namespace WindowAPI {
    interface Dm {
      create: InferHandler<typeof handler>
    }
  }
}
