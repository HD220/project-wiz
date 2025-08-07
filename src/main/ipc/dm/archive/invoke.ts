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

const ArchiveDMOutputSchema = z.object({
  id: z.string(),
  name: z.string().nullable(),
  description: z.string().nullable(),
});

const handler = createIPCHandler({
  inputSchema: ArchiveDMInputSchema,
  outputSchema: ArchiveDMOutputSchema,
  handler: async (input) => {
    logger.debug("Archiving DM conversation", { dmId: input.dmId });

    const currentUser = requireAuth();
    
    // Archive DM conversation with ownership validation
    const dbConversation = await archiveDMConversation({
      ownerId: currentUser.id,
      id: input.dmId
    });
    
    if (!dbConversation) {
      throw new Error("Failed to archive DM conversation or access denied");
    }
    
    // Mapeamento simplificado: apenas id, name, description
    const apiConversation = {
      id: dbConversation.id!,
      name: dbConversation.name,
      description: dbConversation.description,
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