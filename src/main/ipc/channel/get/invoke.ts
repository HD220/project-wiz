import { z } from "zod";
import { findProjectChannel } from "@/main/ipc/channel/queries";
import { ChannelSchema } from "@/shared/types/channel";
import { requireAuth } from "@/main/services/session-registry";
import { getLogger } from "@/shared/services/logger/config";
import { eventBus } from "@/shared/services/events/event-bus";
import { createIPCHandler, InferHandler } from "@/shared/utils/create-ipc-handler";

const logger = getLogger("channel.get.invoke");

const GetChannelInputSchema = z.object({
  channelId: z.string().min(1, "Channel ID is required"),
});

const GetChannelOutputSchema = ChannelSchema.extend({
  isArchived: z.boolean(),
  isActive: z.boolean(),
  deactivatedAt: z.number().nullable(),
  deactivatedBy: z.string().nullable(),
}).nullable();

const handler = createIPCHandler({
  inputSchema: GetChannelInputSchema,
  outputSchema: GetChannelOutputSchema,
  handler: async (input) => {
    logger.debug("Getting channel by ID", { channelId: input.channelId });

    const currentUser = requireAuth();
    
    // Find channel with ownership validation
    const dbChannel = await findProjectChannel(input.channelId, currentUser.id);
    
    // Map database result to API format
    const result = dbChannel ? {
      id: dbChannel.id,
      projectId: dbChannel.projectId,
      name: dbChannel.name,
      description: dbChannel.description,
      archivedAt: dbChannel.archivedAt ? new Date(dbChannel.archivedAt) : null,
      archivedBy: dbChannel.archivedBy,
      createdAt: new Date(dbChannel.createdAt),
      updatedAt: new Date(dbChannel.updatedAt),
      isArchived: !!dbChannel.archivedAt,
      isActive: dbChannel.isActive,
      deactivatedAt: dbChannel.deactivatedAt,
      deactivatedBy: dbChannel.deactivatedBy,
    } : null;
    
    logger.debug("Channel found", { found: !!result, channelId: input.channelId });
    
    // Emit event
    eventBus.emit("channel:get", { channelId: input.channelId, found: !!result });
    
    return result;
  }
});

export default handler;

declare global {
  namespace WindowAPI {
    interface Channel {
      get: InferHandler<typeof handler>
    }
  }
}