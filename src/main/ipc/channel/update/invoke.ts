import { z } from "zod";
import { updateChannel } from "./queries";
import { 
  UpdateChannelInputSchema,
  UpdateChannelOutputSchema,
  type UpdateChannelInput,
  type UpdateChannelOutput 
} from "@/shared/types/channel";
import { requireAuth } from "@/main/utils/session-registry";
import { getLogger } from "@/shared/logger/config";
import { eventBus } from "@/shared/events/event-bus";

const logger = getLogger("channel.update.invoke");

export default async function(input: unknown): Promise<UpdateChannelOutput> {
  // Parse and validate input
  const validatedInput = UpdateChannelInputSchema.parse(input);
  
  logger.debug("Updating channel", { channelId: validatedInput.channelId });

  // 1. Check authentication (replicando a lógica do controller original)
  const currentUser = requireAuth();
  
  // 2. Execute core business logic
  const result = await updateChannel(validatedInput);
  
  // 3. Emit specific event for channel update
  eventBus.emit("channel:updated", { channelId: result.id });
  
  logger.debug("Channel updated", { channelId: result.id, channelName: result.name });
  
  // Parse and return output
  return UpdateChannelOutputSchema.parse(result);
}

declare global {
  namespace WindowAPI {
    interface Channel {
      update: (input: UpdateChannelInput) => Promise<UpdateChannelOutput>
    }
  }
}