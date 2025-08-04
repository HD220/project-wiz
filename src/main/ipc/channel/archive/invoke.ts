import { z } from "zod";
import { 
  archiveChannel,
  type ArchiveChannelInput,
  type ArchiveChannelOutput 
} from "./queries";
import { requireAuth } from "@/main/utils/session-registry";
import { getLogger } from "@/shared/logger/config";
import { eventBus } from "@/shared/events/event-bus";

const logger = getLogger("channel.archive.invoke");

// Input type para o invoke (sem archivedBy que é adicionado automaticamente)
export type ArchiveChannelInvokeInput = Omit<ArchiveChannelInput, "archivedBy">;

export default async function(input: ArchiveChannelInvokeInput): Promise<ArchiveChannelOutput> {
  logger.debug("Archiving channel", { channelId: input.channelId });

  // 1. Check authentication (replicando a lógica do controller original)
  const currentUser = requireAuth();
  
  // 2. Add archivedBy from current user
  const archiveData = {
    ...input,
    archivedBy: currentUser.id
  };
  
  // 3. Execute core business logic
  const result = await archiveChannel(archiveData);
  
  // 4. Emit specific event for channel archive
  eventBus.emit("channel:archived", { channelId: input.channelId });
  
  logger.debug("Channel archived", { channelId: input.channelId, success: result.success });
  
  return result;
}

declare global {
  namespace WindowAPI {
    interface Channel {
      archive: (input: ArchiveChannelInvokeInput) => Promise<ArchiveChannelOutput>
    }
  }
}