import { z } from "zod";
import { archiveChannel } from "./queries";
import { 
  ArchiveChannelInputSchema,
  ArchiveChannelOutputSchema,
  type ArchiveChannelInput,
  type ArchiveChannelOutput 
} from "@/shared/types/channel";
import { requireAuth } from "@/main/services/session-registry";
import { getLogger } from "@/shared/logger/config";
import { eventBus } from "@/shared/events/event-bus";

const logger = getLogger("channel.archive.invoke");

// Input type para o invoke (sem archivedBy que é adicionado automaticamente)
export type ArchiveChannelInvokeInput = Omit<ArchiveChannelInput, "archivedBy">;

// Schema for the invoke input (without archivedBy)
const ArchiveChannelInvokeInputSchema = z.object({
  channelId: z.string().min(1, "Channel ID is required"),
});

export default async function(input: unknown): Promise<ArchiveChannelOutput> {
  // Parse and validate input
  const validatedInvokeInput = ArchiveChannelInvokeInputSchema.parse(input);
  
  logger.debug("Archiving channel", { channelId: validatedInvokeInput.channelId });

  // 1. Check authentication (replicando a lógica do controller original)
  const currentUser = requireAuth();
  
  // 2. Add archivedBy from current user and validate full input
  const archiveData = {
    ...validatedInvokeInput,
    archivedBy: currentUser.id
  };
  
  const validatedArchiveData = ArchiveChannelInputSchema.parse(archiveData);
  
  // 3. Execute core business logic
  const result = await archiveChannel(validatedArchiveData);
  
  // 4. Emit specific event for channel archive
  eventBus.emit("channel:archived", { channelId: validatedInvokeInput.channelId });
  
  logger.debug("Channel archived", { channelId: validatedInvokeInput.channelId, success: result.success });
  
  // Parse and return output
  return ArchiveChannelOutputSchema.parse(result);
}

declare global {
  namespace WindowAPI {
    interface Channel {
      archive: (input: ArchiveChannelInvokeInput) => Promise<ArchiveChannelOutput>
    }
  }
}