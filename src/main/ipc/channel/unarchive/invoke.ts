import { z } from "zod";
import { unarchiveChannel } from "./queries";
import { 
  UnarchiveChannelInputSchema,
  UnarchiveChannelOutputSchema,
  type UnarchiveChannelInput,
  type UnarchiveChannelOutput 
} from "@/shared/types/channel";
import { requireAuth } from "@/main/utils/session-registry";
import { getLogger } from "@/shared/logger/config";
import { eventBus } from "@/shared/events/event-bus";

const logger = getLogger("channel.unarchive.invoke");

export default async function(input: unknown): Promise<UnarchiveChannelOutput> {
  // Parse and validate input
  const validatedChannelId = UnarchiveChannelInputSchema.parse(input);
  
  logger.debug("Unarchiving channel", { channelId: validatedChannelId });

  // 1. Check authentication
  const currentUser = requireAuth();
  
  // 2. Execute core business logic
  const result = await unarchiveChannel(validatedChannelId);
  
  // 3. Emit specific event for channel unarchive
  eventBus.emit("channel:unarchived", { channelId: validatedChannelId });
  
  logger.debug("Channel unarchived", { channelId: validatedChannelId, success: result.success });
  
  // Parse and return output
  return UnarchiveChannelOutputSchema.parse(result);
}

declare global {
  namespace WindowAPI {
    interface Channel {
      unarchive: (channelId: UnarchiveChannelInput) => Promise<UnarchiveChannelOutput>
    }
  }
}