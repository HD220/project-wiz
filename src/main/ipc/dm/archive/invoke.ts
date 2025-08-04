import { z } from "zod";
import { archiveDM } from "./queries";
import { 
  ArchiveDMInputSchema,
  ArchiveDMOutputSchema,
  type ArchiveDMInput,
  type ArchiveDMOutput 
} from "@/shared/types/dm-conversation";
import { requireAuth } from "@/main/services/session-registry";
import { getLogger } from "@/shared/logger/config";
import { eventBus } from "@/shared/events/event-bus";

const logger = getLogger("dm.archive.invoke");

// Input type para o invoke (sem archivedBy que é adicionado automaticamente)
export type ArchiveDMInvokeInput = Omit<ArchiveDMInput, "archivedBy">;

export default async function(input: ArchiveDMInvokeInput): Promise<ArchiveDMOutput> {
  logger.debug("Archiving DM conversation", { dmId: input.dmId });

  // 1. Parse and validate input
  const parsedInput = z.object({
    dmId: z.string().min(1, "DM ID is required")
  }).parse(input);

  // 2. Check authentication
  const currentUser = requireAuth();
  
  // 3. Add archivedBy from current user
  const archiveData: ArchiveDMInput = {
    ...parsedInput,
    archivedBy: currentUser.id
  };
  
  // 4. Execute core business logic
  const result = await archiveDM(archiveData);
  
  // 5. Emit specific event for this operation
  eventBus.emit("dm:archived", { dmId: input.dmId });
  
  logger.debug("DM conversation archived", { dmId: input.dmId, success: result.success });
  
  // 6. Parse and return output
  return ArchiveDMOutputSchema.parse(result);
}

declare global {
  namespace WindowAPI {
    interface Dm {
      archive: (input: ArchiveDMInvokeInput) => Promise<ArchiveDMOutput>
    }
  }
}