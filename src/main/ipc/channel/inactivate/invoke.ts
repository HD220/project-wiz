import { z } from "zod";
import { inactivateProjectChannel } from "@/main/ipc/channel/queries";
import { ChannelSchema } from "@/shared/types/channel";
import { requireAuth } from "@/main/services/session-registry";
import { getLogger } from "@/shared/services/logger/config";
import { eventBus } from "@/shared/services/events/event-bus";
import { createIPCHandler, InferHandler } from "@/shared/utils/create-ipc-handler";

const logger = getLogger("channel.inactivate.invoke");

const InactivateChannelInputSchema = z.object({
  channelId: z.string().min(1, "Channel ID is required"),
});

const InactivateChannelOutputSchema = ChannelSchema;

const handler = createIPCHandler({
  inputSchema: InactivateChannelInputSchema,
  outputSchema: InactivateChannelOutputSchema,
  handler: async (input) => {
    logger.debug("Inactivating channel", { channelId: input.channelId });

    const currentUser = requireAuth();
    
    // Inactivate channel with ownership validation
    const dbChannel = await inactivateProjectChannel(
      input.channelId,
      currentUser.id,
      currentUser.id
    );
    
    if (!dbChannel) {
      throw new Error("Failed to inactivate channel or access denied");
    }
    
    // Mapeamento: SelectChannel → Channel (dados puros da entidade)
    const apiChannel = {
      id: dbChannel.id!,
      projectId: dbChannel.projectId,
      name: dbChannel.name,
      description: dbChannel.description,
      archivedAt: dbChannel.archivedAt ? new Date(dbChannel.archivedAt) : null,
      archivedBy: dbChannel.archivedBy,
      createdAt: new Date(dbChannel.createdAt),
      updatedAt: new Date(dbChannel.updatedAt),
      isActive: dbChannel.isActive,
      isArchived: !!dbChannel.archivedAt,
      deactivatedAt: dbChannel.deactivatedAt ? new Date(dbChannel.deactivatedAt) : null,
      deactivatedBy: dbChannel.deactivatedBy,
    };
    
    logger.debug("Channel inactivated", { channelId: apiChannel.id });
    
    // Emit specific event for channel inactivation
    eventBus.emit("channel:inactivated", { channelId: apiChannel.id });
    
    return apiChannel;
  }
});

export default handler;

declare global {
  namespace WindowAPI {
    interface Channel {
      inactivate: InferHandler<typeof handler>
    }
  }
}