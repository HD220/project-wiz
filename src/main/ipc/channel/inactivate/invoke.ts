import { z } from "zod";
import { inactivateProjectChannel } from "@/main/ipc/channel/queries";
import { 
  DeleteChannelInputSchema,
  DeleteChannelOutputSchema,
  type DeleteChannelInput,
  type DeleteChannelOutput 
} from "@/shared/types/channel";
import { requireAuth } from "@/main/services/session-registry";
import { getLogger } from "@/shared/services/logger/config";
import { eventBus } from "@/shared/services/events/event-bus";

const logger = getLogger("channel.inactivate.invoke");

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
  
  // 3. Inactivate channel with ownership validation
  const dbChannel = await inactivateProjectChannel(
    validatedInvokeInput.channelId,
    currentUser.id,
    currentUser.id
  );
  
  const success = !!dbChannel;
  const result = {
    success,
    message: success ? "Channel inactivated successfully" : "Failed to inactivate channel or access denied"
  };
  
  // 4. Emit specific event for channel inactivation
  if (success) {
    eventBus.emit("channel:inactivated", { channelId: validatedInvokeInput.channelId });
  }
  
  logger.debug("Channel inactivated", { channelId: validatedInvokeInput.channelId, success: result.success });
  
  // 5. Validate and return output
  return DeleteChannelOutputSchema.parse(result);
}

declare global {
  namespace WindowAPI {
    interface Channel {
      delete: (input: DeleteChannelInvokeInput) => Promise<DeleteChannelOutput>
    }
  }
}