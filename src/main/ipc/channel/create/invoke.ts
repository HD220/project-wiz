import { createProjectChannel } from "@/main/ipc/channel/queries";
import { ChannelSchema } from "@/shared/types";
import { requireAuth } from "@/main/services/session-registry";
import { getLogger } from "@/shared/services/logger/config";
import { eventBus } from "@/shared/services/events/event-bus";
import { createIPCHandler, InferHandler } from "@/shared/utils/create-ipc-handler";

const logger = getLogger("channel.create.invoke");

const CreateChannelInputSchema = ChannelSchema.pick({
  projectId: true,
  name: true,
  description: true,
});

const CreateChannelOutputSchema = ChannelSchema;

const handler = createIPCHandler({
  inputSchema: CreateChannelInputSchema,
  outputSchema: CreateChannelOutputSchema,
  handler: async (input) => {
    logger.debug("Creating channel");

    const currentUser = requireAuth();
    
    // Create channel with ownership validation
    const dbChannel = await createProjectChannel({
      ...input,
      ownerId: currentUser.id
    });
    
    // Map database result to shared type
    const apiChannel = {
      id: dbChannel.id,
      projectId: dbChannel.projectId,
      name: dbChannel.name,
      description: dbChannel.description,
      archivedAt: dbChannel.archivedAt ? new Date(dbChannel.archivedAt) : null,
      archivedBy: null,
      createdAt: new Date(dbChannel.createdAt),
      updatedAt: new Date(dbChannel.updatedAt),
      deactivatedAt: null,
      isActive: true,
      isArchived: false,
    };
    
    // Emit event
    eventBus.emit("channel:created", { channelId: apiChannel.id });
    
    logger.debug("Channel created", { channelId: apiChannel.id });
    
    return apiChannel;
  }
});

export default handler;

declare global {
  namespace WindowAPI {
    interface Channel {
      create: InferHandler<typeof handler>
    }
  }
}