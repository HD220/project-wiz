import { z } from "zod";
import { inactivateDMConversation } from "@/main/ipc/dm/queries";
import { DMConversationSchema } from "@/shared/types/dm-conversation";
import { requireAuth } from "@/main/services/session-registry";
import { getLogger } from "@/shared/services/logger/config";
import { eventBus } from "@/shared/services/events/event-bus";
import { createIPCHandler, InferHandler } from "@/shared/utils/create-ipc-handler";

const logger = getLogger("dm.inactivate.invoke");

const InactivateDMInputSchema = z.object({
  dmId: z.string().min(1, "DM ID is required"),
});

const InactivateDMOutputSchema = DMConversationSchema.extend({
  isActive: z.boolean(),
  deactivatedAt: z.date().nullable(),
  deactivatedBy: z.string().nullable(),
});

const handler = createIPCHandler({
  inputSchema: InactivateDMInputSchema,
  outputSchema: InactivateDMOutputSchema,
  handler: async (input) => {
    logger.debug("Inactivating DM conversation", { dmId: input.dmId });

    const currentUser = requireAuth();
    
    // Inactivate DM conversation with ownership validation
    const dbConversation = await inactivateDMConversation(input.dmId, currentUser.id, currentUser.id);
    
    if (!dbConversation) {
      throw new Error("Failed to inactivate DM conversation or access denied");
    }
    
    // Mapeamento: SelectDMConversation → DMConversation (dados puros da entidade)
    const apiConversation = {
      id: dbConversation.id!,
      name: dbConversation.name,
      description: dbConversation.description,
      archivedAt: dbConversation.archivedAt,
      archivedBy: dbConversation.archivedBy,
      createdAt: dbConversation.createdAt,
      updatedAt: dbConversation.updatedAt,
      isActive: dbConversation.isActive,
      deactivatedAt: dbConversation.deactivatedAt,
      deactivatedBy: dbConversation.deactivatedBy,
    };
    
    logger.debug("DM conversation inactivated", { dmId: apiConversation.id });
    
    // Emit event
    eventBus.emit("dm:inactivated", { dmId: apiConversation.id });
    
    return apiConversation;
  }
});

export default handler;

declare global {
  namespace WindowAPI {
    interface Dm {
      inactivate: InferHandler<typeof handler>
    }
  }
}
