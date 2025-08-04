import { z } from "zod";
import { 
  unarchiveChannel,
  type UnarchiveChannelInput,
  type UnarchiveChannelOutput 
} from "./queries";
import { requireAuth } from "@/main/utils/session-registry";
import { getLogger } from "@/shared/logger/config";
import { eventBus } from "@/shared/events/event-bus";

const logger = getLogger("channel.unarchive.invoke");

export default async function(channelId: UnarchiveChannelInput): Promise<UnarchiveChannelOutput> {
  logger.debug("Unarchiving channel", { channelId });

  // 1. Check authentication
  const currentUser = requireAuth();
  
  // 2. Execute core business logic
  const result = await unarchiveChannel(channelId);
  
  // 3. Emit specific event for channel unarchive
  eventBus.emit("channel:unarchived", { channelId });
  
  logger.debug("Channel unarchived", { channelId, success: result.success });
  
  return result;
}

declare global {
  namespace WindowAPI {
    interface Channel {
      unarchive: (channelId: UnarchiveChannelInput) => Promise<UnarchiveChannelOutput>
    }
  }
}