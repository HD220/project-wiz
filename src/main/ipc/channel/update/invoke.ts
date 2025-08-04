import { z } from "zod";
import { 
  updateChannel,
  type UpdateChannelInput,
  type UpdateChannelOutput 
} from "./queries";
import { requireAuth } from "@/main/utils/session-registry";
import { getLogger } from "@/shared/logger/config";
import { eventBus } from "@/shared/events/event-bus";

const logger = getLogger("channel.update.invoke");

export default async function(input: UpdateChannelInput): Promise<UpdateChannelOutput> {
  logger.debug("Updating channel", { channelId: input.channelId });

  // 1. Check authentication (replicando a lógica do controller original)
  const currentUser = requireAuth();
  
  // 2. Execute core business logic
  const result = await updateChannel(input);
  
  // 3. Emit specific event for channel update
  eventBus.emit("channel:updated", { channelId: result.id });
  
  logger.debug("Channel updated", { channelId: result.id, channelName: result.name });
  
  return result;
}

declare global {
  namespace WindowAPI {
    interface Channel {
      update: (input: UpdateChannelInput) => Promise<UpdateChannelOutput>
    }
  }
}