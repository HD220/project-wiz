import { z } from "zod";
import { 
  archiveDM,
  type ArchiveDMInput,
  type ArchiveDMOutput 
} from "./queries";
import { requireAuth } from "@/main/utils/session-registry";
import { getLogger } from "@/shared/logger/config";
import { eventBus } from "@/shared/events/event-bus";

const logger = getLogger("dm.archive.invoke");

// Input type para o invoke (sem archivedBy que é adicionado automaticamente)
export type ArchiveDMInvokeInput = Omit<ArchiveDMInput, "archivedBy">;

export default async function(input: ArchiveDMInvokeInput): Promise<ArchiveDMOutput> {
  logger.debug("Archiving DM conversation", { dmId: input.dmId });

  // 1. Check authentication
  const currentUser = requireAuth();
  
  // 2. Add archivedBy from current user
  const archiveData = {
    ...input,
    archivedBy: currentUser.id
  };
  
  // 3. Execute core business logic
  const result = await archiveDM(archiveData);
  
  // 4. Emit specific event for this operation
  eventBus.emit("dm:archived", { dmId: input.dmId });
  
  logger.debug("DM conversation archived", { dmId: input.dmId, success: result.success });
  
  return result;
}

declare global {
  namespace WindowAPI {
    interface Dm {
      archive: (input: ArchiveDMInvokeInput) => Promise<ArchiveDMOutput>
    }
  }
}