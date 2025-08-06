import { z } from "zod";
import { archiveDMConversation } from "@/main/ipc/dm/queries";
import { DMConversationSchema } from "@/shared/types/dm-conversation";
import { requireAuth } from "@/main/services/session-registry";
import { getLogger } from "@/shared/services/logger/config";
import { eventBus } from "@/shared/services/events/event-bus";
import { createIPCHandler, InferHandler } from "@/shared/utils/create-ipc-handler";

const logger = getLogger("dm.archive.invoke");

const ArchiveDMInputSchema = z.object({
  dmId: z.string().min(1, "DM ID is required"),
});

const ArchiveDMOutputSchema = DMConversationSchema.extend({
  archivedAt: z.date().nullable(),
  archivedBy: z.string().nullable(),
});

const handler = createIPCHandler({
  inputSchema: ArchiveDMInputSchema,
  outputSchema: ArchiveDMOutputSchema,
  handler: async (input) => {
    logger.debug("Archiving DM conversation", { dmId: input.dmId });

    const currentUser = requireAuth();
    
    // Archive DM conversation with ownership validation
    const dbConversation = await archiveDMConversation(input.dmId, currentUser.id, currentUser.id);
    
    if (!dbConversation) {
      throw new Error("Failed to archive DM conversation or access denied");
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
    };
    
    logger.debug("DM conversation archived", { dmId: apiConversation.id });
    
    // Emit event
    eventBus.emit("dm:archived", { dmId: apiConversation.id });
    
    return apiConversation;
  }
});

export default handler;

declare global {
  namespace WindowAPI {
    interface Dm {
      archive: InferHandler<typeof handler>
    }
  }
}