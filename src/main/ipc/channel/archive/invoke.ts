import { z } from "zod";
import { archiveProjectChannel } from "@/main/ipc/channel/queries";
import { ChannelSchema } from "@/shared/types/channel";
import { requireAuth } from "@/main/services/session-registry";
import { getLogger } from "@/shared/services/logger/config";
import { eventBus } from "@/shared/services/events/event-bus";

const logger = getLogger("channel.archive.invoke");

// Input schema - apenas o channelId (archivedBy vem do currentUser)
const ArchiveChannelInputSchema = z.object({
  channelId: z.string().min(1, "Channel ID is required"),
});

// Output schema - extende ChannelSchema com campos de arquivamento
const ArchiveChannelOutputSchema = ChannelSchema.extend({
  archivedAt: z.date().nullable(),
  archivedBy: z.string().nullable(),
});

type ArchiveChannelInput = z.infer<typeof ArchiveChannelInputSchema>;
type ArchiveChannelOutput = z.infer<typeof ArchiveChannelOutputSchema>;

export default async function(input: ArchiveChannelInput): Promise<ArchiveChannelOutput> {
  logger.debug("Archiving channel", { channelId: input.channelId });

  // 1. Validate input
  const validatedInput = ArchiveChannelInputSchema.parse(input);
  
  // 2. Check authentication
  const currentUser = requireAuth();
  
  // 3. Archive channel with ownership validation
  const dbChannel = await archiveProjectChannel(
    validatedInput.channelId,
    currentUser.id,
    currentUser.id
  );
  
  if (!dbChannel) {
    throw new Error("Failed to archive channel or access denied");
  }
  
  // 4. Mapeamento: SelectChannel → Channel (dados puros da entidade)
  const apiChannel = {
    id: dbChannel.id,
    projectId: dbChannel.projectId,
    name: dbChannel.name,
    description: dbChannel.description,
    archivedAt: dbChannel.archivedAt ? new Date(dbChannel.archivedAt) : null,
    archivedBy: dbChannel.archivedBy,
    createdAt: new Date(dbChannel.createdAt),
    updatedAt: new Date(dbChannel.updatedAt),
  };
  
  // 5. Validate output
  const result = ArchiveChannelOutputSchema.parse(apiChannel);
  
  logger.debug("Channel archived", { channelId: result.id });
  
  // 6. Emit specific event for channel archive
  eventBus.emit("channel:archived", { channelId: result.id });
  
  return result;
}

declare global {
  namespace WindowAPI {
    interface Channel {
      archive: (input: ArchiveChannelInput) => Promise<ArchiveChannelOutput>
    }
  }
}