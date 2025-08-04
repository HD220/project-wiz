import { z } from "zod";
import { createChannel } from "./queries";
import { ChannelSchema } from "@/shared/types";
import { requireAuth } from "@/main/utils/session-registry";
import { getLogger } from "@/shared/logger/config";
import { eventBus } from "@/shared/events/event-bus";

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
  
  // 3. Query recebe dados e gerencia campos técnicos internamente
  const dbChannel = await createChannel(validatedInput);
  
  // 4. Mapeamento: SelectProjectChannel → Channel (sem campos técnicos)
  const apiChannel = {
    id: dbChannel.id,
    projectId: dbChannel.projectId,
    name: dbChannel.name,
    description: dbChannel.description,
    isArchived: dbChannel.isArchived,
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