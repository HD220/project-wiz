import { z } from "zod";
import { archiveDMConversation } from "@/main/ipc/dm/queries";
import { DMConversationSchema } from "@/shared/types/dm-conversation";
import { requireAuth } from "@/main/services/session-registry";
import { getLogger } from "@/shared/services/logger/config";
import { eventBus } from "@/shared/services/events/event-bus";

const logger = getLogger("dm.archive.invoke");

// Input schema - apenas o dmId (archivedBy vem do currentUser)
const ArchiveDMInputSchema = z.object({
  dmId: z.string().min(1, "DM ID is required"),
});

// Output schema - extende DMConversationSchema com campos de arquivamento
const ArchiveDMOutputSchema = DMConversationSchema.extend({
  archivedAt: z.date().nullable(),
  archivedBy: z.string().nullable(),
});

type ArchiveDMInput = z.infer<typeof ArchiveDMInputSchema>;
type ArchiveDMOutput = z.infer<typeof ArchiveDMOutputSchema>;

export default async function(input: ArchiveDMInput): Promise<ArchiveDMOutput> {
  logger.debug("Archiving DM conversation", { dmId: input.dmId });

  // 1. Validate input
  const validatedInput = ArchiveDMInputSchema.parse(input);

  // 2. Check authentication
  const currentUser = requireAuth();
  
  // 3. Archive DM conversation with ownership validation
  const dbConversation = await archiveDMConversation(validatedInput.dmId, currentUser.id, currentUser.id);
  
  if (!dbConversation) {
    throw new Error("Failed to archive DM conversation or access denied");
  }
  
  // 4. Map to API format
  const apiConversation = {
    id: dbConversation.id!,
    name: dbConversation.name,
    description: dbConversation.description,
    archivedAt: dbConversation.archivedAt,
    archivedBy: dbConversation.archivedBy,
    createdAt: dbConversation.createdAt,
    updatedAt: dbConversation.updatedAt,
  };
  
  // 5. Validate output
  const result = ArchiveDMOutputSchema.parse(apiConversation);
  
  logger.debug("DM conversation archived", { dmId: result.id });
  
  // 6. Emit event
  eventBus.emit("dm:archived", { dmId: result.id });
  
  return result;
}

declare global {
  namespace WindowAPI {
    interface Dm {
      archive: (input: ArchiveDMInput) => Promise<ArchiveDMOutput>
    }
  }
}