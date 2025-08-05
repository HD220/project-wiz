import { z } from "zod";
import { updateProjectChannel } from "@/main/ipc/channel/queries";
import { 
  UpdateChannelInputSchema,
  UpdateChannelOutputSchema,
  type UpdateChannelInput,
  type UpdateChannelOutput 
} from "@/shared/types/channel";
import { requireAuth } from "@/main/services/session-registry";
import { getLogger } from "@/shared/services/logger/config";
import { eventBus } from "@/shared/services/events/event-bus";

const logger = getLogger("channel.update.invoke");

export default async function(input: unknown): Promise<UpdateChannelOutput> {
  // Parse and validate input
  const validatedInput = UpdateChannelInputSchema.parse(input);
  
  logger.debug("Updating channel", { channelId: validatedInput.channelId });

  // 1. Check authentication (replicando a lógica do controller original)
  const currentUser = requireAuth();
  
  // 2. Update channel with ownership validation
  const dbChannel = await updateProjectChannel({
    id: validatedInput.channelId,
    ownerId: currentUser.id,
    name: validatedInput.name,
    description: validatedInput.description
  });
  
  if (!dbChannel) {
    throw new Error(`Failed to update channel or access denied: ${validatedInput.channelId}`);
  }
  
  // 3. Map database result to shared type
  const result = {
    id: dbChannel.id,
    projectId: dbChannel.projectId,
    name: dbChannel.name,
    description: dbChannel.description,
    isArchived: !!dbChannel.archivedAt,
    isActive: dbChannel.isActive,
    deactivatedAt: dbChannel.deactivatedAt,
    deactivatedBy: dbChannel.deactivatedBy,
    createdAt: dbChannel.createdAt,
    updatedAt: dbChannel.updatedAt,
  };
  
  // 4. Emit specific event for channel update
  eventBus.emit("channel:updated", { channelId: result.id });
  
  logger.debug("Channel updated", { channelId: result.id, channelName: result.name });
  
  // 5. Validate and return output
  return UpdateChannelOutputSchema.parse(result);
}

declare global {
  namespace WindowAPI {
    interface Channel {
      update: (input: UpdateChannelInput) => Promise<UpdateChannelOutput>
    }
  }
}