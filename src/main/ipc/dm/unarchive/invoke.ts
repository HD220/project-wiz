import { z } from "zod";
import { unarchiveDMConversation } from "@/main/ipc/dm/queries";
import { DMConversationSchema } from "@/shared/types/dm-conversation";
import { requireAuth } from "@/main/services/session-registry";
import { getLogger } from "@/shared/services/logger/config";
import { eventBus } from "@/shared/services/events/event-bus";
import { createIPCHandler, InferHandler } from "@/shared/utils/create-ipc-handler";

const logger = getLogger("dm.unarchive.invoke");

const UnarchiveDMInputSchema = z.object({
  dmId: z.string().min(1, "DM ID is required"),
});

const UnarchiveDMOutputSchema = DMConversationSchema.extend({
  archivedAt: z.date().nullable(),
  archivedBy: z.string().nullable(),
});

const handler = createIPCHandler({
  inputSchema: UnarchiveDMInputSchema,
  outputSchema: UnarchiveDMOutputSchema,
  handler: async (input) => {
    logger.debug("Unarchiving DM conversation", { dmId: input.dmId });

    const currentUser = requireAuth();
    
    // Execute query with ownership validation
    const dbConversation = await unarchiveDMConversation(input.dmId, currentUser.id);
    
    if (!dbConversation) {
      throw new Error("DM conversation not found or access denied");
    }
    
    // Mapeamento: SelectDMConversation → DMConversation (dados puros da entidade)
    const apiConversation = {
      id: dbConversation.id,
      name: dbConversation.name,
      description: dbConversation.description,
      archivedAt: dbConversation.archivedAt ? new Date(dbConversation.archivedAt) : null,
      archivedBy: dbConversation.archivedBy,
      createdAt: new Date(dbConversation.createdAt),
      updatedAt: new Date(dbConversation.updatedAt),
    };
    
    logger.debug("DM conversation unarchived", { dmId: input.dmId });
    
    // Emit event
    eventBus.emit("dm:unarchived", { dmId: input.dmId });
    
    return apiConversation;
  }
});

export default handler;

declare global {
  namespace WindowAPI {
    interface Dm {
      unarchive: InferHandler<typeof handler>
    }
  }
}
