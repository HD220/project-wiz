import { z } from "zod";
import { unarchiveProjectChannel } from "@/main/ipc/channel/queries";
import { 
  UnarchiveChannelInputSchema,
  UnarchiveChannelOutputSchema,
  type UnarchiveChannelInput,
  type UnarchiveChannelOutput 
} from "@/shared/types/channel";
import { requireAuth } from "@/main/services/session-registry";
import { getLogger } from "@/shared/services/logger/config";
import { eventBus } from "@/shared/services/events/event-bus";

const logger = getLogger("channel.unarchive.invoke");

export default async function(input: unknown): Promise<UnarchiveChannelOutput> {
  // Parse and validate input
  const validatedChannelId = UnarchiveChannelInputSchema.parse(input);
  
  logger.debug("Unarchiving channel", { channelId: validatedChannelId });

  // 1. Check authentication
  const currentUser = requireAuth();
  
  // 2. Unarchive channel with ownership validation
  const dbChannel = await unarchiveProjectChannel(validatedChannelId, currentUser.id);
  
  const success = !!dbChannel;
  const result = {
    success,
    message: success ? "Channel unarchived successfully" : "Failed to unarchive channel or access denied"
  };
  
  // 3. Emit specific event for channel unarchive
  if (success) {
    eventBus.emit("channel:unarchived", { channelId: validatedChannelId });
  }
  
  logger.debug("Channel unarchived", { channelId: validatedChannelId, success: result.success });
  
  // 4. Validate and return output
  return UnarchiveChannelOutputSchema.parse(result);
}

declare global {
  namespace WindowAPI {
    interface Channel {
      unarchive: (channelId: UnarchiveChannelInput) => Promise<UnarchiveChannelOutput>
    }
  }
}