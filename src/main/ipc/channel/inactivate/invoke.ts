import { z } from "zod";
import { inactivateProjectChannel } from "@/main/ipc/channel/queries";
import { ChannelSchema } from "@/shared/types/channel";
import { requireAuth } from "@/main/services/session-registry";
import { getLogger } from "@/shared/services/logger/config";
import { eventBus } from "@/shared/services/events/event-bus";

const logger = getLogger("channel.inactivate.invoke");

// Input schema - apenas o channelId (deletedBy vem do currentUser)
const InactivateChannelInputSchema = z.object({
  channelId: z.string().min(1, "Channel ID is required"),
});

// Output schema - extende ChannelSchema com campos de inativação
const InactivateChannelOutputSchema = ChannelSchema.extend({
  isActive: z.boolean(),
  deactivatedAt: z.number().nullable(),
  deactivatedBy: z.string().nullable(),
});

type InactivateChannelInput = z.infer<typeof InactivateChannelInputSchema>;
type InactivateChannelOutput = z.infer<typeof InactivateChannelOutputSchema>;

export default async function(input: InactivateChannelInput): Promise<InactivateChannelOutput> {
  logger.debug("Inactivating channel", { channelId: input.channelId });

  // 1. Validate input
  const validatedInput = InactivateChannelInputSchema.parse(input);
  
  // 2. Check authentication
  const currentUser = requireAuth();
  
  // 3. Inactivate channel with ownership validation
  const dbChannel = await inactivateProjectChannel(
    validatedInput.channelId,
    currentUser.id,
    currentUser.id
  );
  
  if (!dbChannel) {
    throw new Error("Failed to inactivate channel or access denied");
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
    isActive: dbChannel.isActive,
    deactivatedAt: dbChannel.deactivatedAt,
    deactivatedBy: dbChannel.deactivatedBy,
  };
  
  // 5. Validate output
  const result = InactivateChannelOutputSchema.parse(apiChannel);
  
  logger.debug("Channel inactivated", { channelId: result.id });
  
  // 6. Emit specific event for channel inactivation
  eventBus.emit("channel:inactivated", { channelId: result.id });
  
  return result;
}

declare global {
  namespace WindowAPI {
    interface Channel {
      inactivate: (input: InactivateChannelInput) => Promise<InactivateChannelOutput>
    }
  }
}