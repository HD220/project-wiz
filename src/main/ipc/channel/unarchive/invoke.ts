import { z } from "zod";
import { unarchiveProjectChannel } from "@/main/ipc/channel/queries";
import { ChannelSchema } from "@/shared/types/channel";
import { requireAuth } from "@/main/services/session-registry";
import { getLogger } from "@/shared/services/logger/config";
import { eventBus } from "@/shared/services/events/event-bus";

const logger = getLogger("channel.unarchive.invoke");

// Input schema - object wrapper para consistência
const UnarchiveChannelInputSchema = z.object({
  channelId: z.string().min(1, "Channel ID is required"),
});

// Output schema - extende ChannelSchema com campos de arquivamento
const UnarchiveChannelOutputSchema = ChannelSchema.extend({
  archivedAt: z.date().nullable(),
  archivedBy: z.string().nullable(),
});

type UnarchiveChannelInput = z.infer<typeof UnarchiveChannelInputSchema>;
type UnarchiveChannelOutput = z.infer<typeof UnarchiveChannelOutputSchema>;

export default async function(input: UnarchiveChannelInput): Promise<UnarchiveChannelOutput> {
  logger.debug("Unarchiving channel", { channelId: input.channelId });

  // 1. Validate input
  const validatedInput = UnarchiveChannelInputSchema.parse(input);
  
  // 2. Check authentication
  const currentUser = requireAuth();
  
  // 3. Unarchive channel with ownership validation
  const dbChannel = await unarchiveProjectChannel(validatedInput.channelId, currentUser.id);
  
  if (!dbChannel) {
    throw new Error("Failed to unarchive channel or access denied");
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
  const result = UnarchiveChannelOutputSchema.parse(apiChannel);
  
  logger.debug("Channel unarchived", { channelId: result.id });
  
  // 6. Emit specific event for channel unarchive
  eventBus.emit("channel:unarchived", { channelId: result.id });
  
  return result;
}

declare global {
  namespace WindowAPI {
    interface Channel {
      unarchive: (input: UnarchiveChannelInput) => Promise<UnarchiveChannelOutput>
    }
  }
}