import { sendDMMessage } from "@/main/ipc/dm/queries";
import { MessageSchema } from "@/shared/types";
import { requireAuth } from "@/main/services/session-registry";
import { getLogger } from "@/shared/services/logger/config";
import { eventBus } from "@/shared/services/events/event-bus";
import { createIPCHandler, InferHandler } from "@/shared/utils/create-ipc-handler";

const logger = getLogger("dm.send-message.invoke");

const SendDMMessageInputSchema = MessageSchema.pick({
  sourceId: true,
  content: true
});

const SendDMMessageOutputSchema = MessageSchema;

const handler = createIPCHandler({
  inputSchema: SendDMMessageInputSchema,
  outputSchema: SendDMMessageOutputSchema,
  handler: async (input) => {
    logger.debug("Sending message to DM", { sourceId: input.sourceId, contentLength: input.content.length });

    const currentUser = requireAuth();
    
    // Send message to DM conversation
    const dbMessage = await sendDMMessage({
      sourceType: "dm",
      sourceId: input.sourceId,
      ownerId: currentUser.id,
      content: input.content,
    });
    
    // Mapeamento: SelectMessage → Message (dados puros da entidade)
    const apiMessage = {
      id: dbMessage.id,
      sourceType: dbMessage.sourceType,
      sourceId: dbMessage.sourceId,
      authorId: dbMessage.ownerId, // Map ownerId to authorId for API consistency
      content: dbMessage.content,
      createdAt: new Date(dbMessage.createdAt),
      updatedAt: new Date(dbMessage.updatedAt),
    };
    
    logger.debug("Message sent to DM", { 
      messageId: apiMessage.id, 
      sourceId: apiMessage.sourceId 
    });
    
    // Emit specific event for this operation
    eventBus.emit("dm:message-sent", { messageId: apiMessage.id, sourceId: apiMessage.sourceId });
    
    return apiMessage;
  }
});

export default handler;

declare global {
  namespace WindowAPI {
    interface Dm {
      sendMessage: InferHandler<typeof handler>
    }
  }
}
