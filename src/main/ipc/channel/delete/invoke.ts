import { z } from "zod";
import { 
  deleteChannel,
  type DeleteChannelInput,
  type DeleteChannelOutput 
} from "./queries";
import { requireAuth } from "@/main/utils/session-registry";
import { getLogger } from "@/shared/logger/config";
import { eventBus } from "@/shared/events/event-bus";

const logger = getLogger("channel.delete.invoke");

// Input type para o invoke (sem deletedBy que é adicionado automaticamente)
export type DeleteChannelInvokeInput = Omit<DeleteChannelInput, "deletedBy">;

export default async function(input: DeleteChannelInvokeInput): Promise<DeleteChannelOutput> {
  logger.debug("Deleting channel", { channelId: input.channelId });

  // 1. Check authentication
  const currentUser = requireAuth();
  
  // 2. Add deletedBy from current user
  const deleteData = {
    ...input,
    deletedBy: currentUser.id
  };
  
  // 3. Execute core business logic
  const result = await deleteChannel(deleteData);
  
  // 4. Emit specific event for channel deletion
  eventBus.emit("channel:deleted", { channelId: input.channelId });
  
  logger.debug("Channel deleted", { channelId: input.channelId, success: result.success });
  
  return result;
}

declare global {
  namespace WindowAPI {
    interface Channel {
      delete: (input: DeleteChannelInvokeInput) => Promise<DeleteChannelOutput>
    }
  }
}