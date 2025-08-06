import { z } from "zod";
import { updateProjectChannel } from "@/main/ipc/channel/queries";
import { ChannelSchema } from "@/shared/types/channel";
import { requireAuth } from "@/main/services/session-registry";
import { getLogger } from "@/shared/services/logger/config";
import { eventBus } from "@/shared/services/events/event-bus";

const logger = getLogger("channel.update.invoke");

// Input schema
const UpdateChannelInputSchema = z.object({
  channelId: z.string().min(1, "Channel ID is required"),
  name: z.string().min(1, "Channel name is required").optional(),
  description: z.string().optional(),
});

// Output schema - extende ChannelSchema com campos adicionais
const UpdateChannelOutputSchema = ChannelSchema.extend({
  isArchived: z.boolean(),
  isActive: z.boolean(),
  deactivatedAt: z.number().nullable(),
  deactivatedBy: z.string().nullable(),
});

type UpdateChannelInput = z.infer<typeof UpdateChannelInputSchema>;
type UpdateChannelOutput = z.infer<typeof UpdateChannelOutputSchema>;

export default async function(input: UpdateChannelInput): Promise<UpdateChannelOutput> {
  logger.debug("Updating channel", { channelId: input.channelId });

  // 1. Validate input
  const validatedInput = UpdateChannelInputSchema.parse(input);
  
  // 2. Check authentication
  const currentUser = requireAuth();
  
  // 3. Update channel with ownership validation
  const dbChannel = await updateProjectChannel({
    id: validatedInput.channelId,
    ownerId: currentUser.id,
    name: validatedInput.name,
    description: validatedInput.description
  });
  
  if (!dbChannel) {
    throw new Error(`Failed to update channel or access denied: ${validatedInput.channelId}`);
  }
  
  // 4. Map database result to API format
  const result = {
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
  };
  
  // 5. Validate output
  const validResult = UpdateChannelOutputSchema.parse(result);
  
  logger.debug("Channel updated", { channelId: validResult.id, channelName: validResult.name });
  
  // 6. Emit specific event for channel update
  eventBus.emit("channel:updated", { channelId: validResult.id });
  
  return validResult;
}

declare global {
  namespace WindowAPI {
    interface Channel {
      update: (input: UpdateChannelInput) => Promise<UpdateChannelOutput>
    }
  }
}