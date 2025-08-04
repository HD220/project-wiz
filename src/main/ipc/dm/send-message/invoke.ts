import { z } from "zod";
import { sendDMMessage } from "./queries";
import { MessageSchema } from "@/shared/types";
import { requireAuth } from "@/main/services/session-registry";
import { getLogger } from "@/shared/logger/config";
import { eventBus } from "@/shared/events/event-bus";

const logger = getLogger("dm.send-message.invoke");

// Input schema - apenas campos de negócio
const SendDMMessageInputSchema = MessageSchema.pick({
  sourceId: true,
  content: true
});

// Output schema
const SendDMMessageOutputSchema = MessageSchema;

type SendDMMessageInput = z.infer<typeof SendDMMessageInputSchema>;
type SendDMMessageOutput = z.infer<typeof SendDMMessageOutputSchema>;

export default async function(input: SendDMMessageInput): Promise<SendDMMessageOutput> {
  logger.debug("Sending message to DM", { sourceId: input.sourceId, contentLength: input.content.length });

  // 1. Validate input
  const validatedInput = SendDMMessageInputSchema.parse(input);

  // 2. Check authentication
  const currentUser = requireAuth();
  
  // 3. Query recebe dados e gerencia campos técnicos internamente
  const dbMessage = await sendDMMessage({
    sourceType: "dm",
    sourceId: validatedInput.sourceId,
    authorId: currentUser.id,
    content: validatedInput.content,
  });
  
  // 4. Mapeamento: SelectMessage → Message (sem campos técnicos)
  const apiMessage = {
    id: dbMessage.id,
    sourceType: dbMessage.sourceType,
    sourceId: dbMessage.sourceId,
    authorId: dbMessage.authorId,
    content: dbMessage.content,
    createdAt: new Date(dbMessage.createdAt),
    updatedAt: new Date(dbMessage.updatedAt),
  };
  
  // 5. Validate output
  const result = SendDMMessageOutputSchema.parse(apiMessage);
  
  logger.debug("Message sent to DM", { 
    messageId: result.id, 
    sourceId: result.sourceId 
  });
  
  // 6. Emit specific event for this operation
  eventBus.emit("dm:message-sent", { messageId: result.id, sourceId: result.sourceId });
  
  return result;
}

declare global {
  namespace WindowAPI {
    interface Dm {
      sendMessage: (input: SendDMMessageInput) => Promise<SendDMMessageOutput>
    }
  }
}
