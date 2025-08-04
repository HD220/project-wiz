import { z } from "zod";
import { deleteChannel } from "./queries";
import { 
  DeleteChannelInputSchema,
  DeleteChannelOutputSchema,
  type DeleteChannelInput,
  type DeleteChannelOutput 
} from "@/shared/types/channel";
import { requireAuth } from "@/main/utils/session-registry";
import { getLogger } from "@/shared/logger/config";
import { eventBus } from "@/shared/events/event-bus";

const logger = getLogger("channel.delete.invoke");

// Input type para o invoke (sem deletedBy que é adicionado automaticamente)
export type DeleteChannelInvokeInput = Omit<DeleteChannelInput, "deletedBy">;

// Schema for the invoke input (without deletedBy)
const DeleteChannelInvokeInputSchema = z.object({
  channelId: z.string().min(1, "Channel ID is required"),
});

export default async function(input: unknown): Promise<DeleteChannelOutput> {
  // Parse and validate input
  const validatedInvokeInput = DeleteChannelInvokeInputSchema.parse(input);
  
  logger.debug("Deleting channel", { channelId: validatedInvokeInput.channelId });

  // 1. Check authentication
  const currentUser = requireAuth();
  
  // 2. Add deletedBy from current user and validate full input
  const deleteData = {
    ...validatedInvokeInput,
    deletedBy: currentUser.id
  };
  
  const validatedDeleteData = DeleteChannelInputSchema.parse(deleteData);
  
  // 3. Execute core business logic
  const result = await deleteChannel(validatedDeleteData);
  
  // 4. Emit specific event for channel deletion
  eventBus.emit("channel:deleted", { channelId: validatedInvokeInput.channelId });
  
  logger.debug("Channel deleted", { channelId: validatedInvokeInput.channelId, success: result.success });
  
  // Parse and return output
  return DeleteChannelOutputSchema.parse(result);
}

declare global {
  namespace WindowAPI {
    interface Channel {
      delete: (input: DeleteChannelInvokeInput) => Promise<DeleteChannelOutput>
    }
  }
}