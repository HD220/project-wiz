import { z } from "zod";
import { createProjectChannel } from "@/main/ipc/channel/queries";
import { ChannelSchema } from "@/shared/types";
import { requireAuth } from "@/main/services/session-registry";
import { getLogger } from "@/shared/services/logger/config";
import { eventBus } from "@/shared/services/events/event-bus";

const logger = getLogger("channel.create.invoke");

// Input schema - apenas campos de negócio
const CreateChannelInputSchema = ChannelSchema.pick({
  projectId: true,
  name: true,
  description: true,
});

// Output schema
const CreateChannelOutputSchema = ChannelSchema;

type CreateChannelInput = z.infer<typeof CreateChannelInputSchema>;
type CreateChannelOutput = z.infer<typeof CreateChannelOutputSchema>;

export default async function(input: CreateChannelInput): Promise<CreateChannelOutput> {
  logger.debug("Creating channel");

  // 1. Validate input
  const validatedInput = CreateChannelInputSchema.parse(input);

  // 2. Check authentication
  const currentUser = requireAuth();
  
  // 3. Create channel with ownership validation
  const dbChannel = await createProjectChannel({
    ...validatedInput,
    ownerId: currentUser.id,
    isActive: true
  });
  
  // 4. Map database result to shared type
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
  const result = CreateChannelOutputSchema.parse(apiChannel);
  
  // 6. Emit event
  eventBus.emit("channel:created", { channelId: result.id });
  
  logger.debug("Channel created", { channelId: result.id });
  
  return result;
}

declare global {
  namespace WindowAPI {
    interface Channel {
      create: (input: CreateChannelInput) => Promise<CreateChannelOutput>
    }
  }
}