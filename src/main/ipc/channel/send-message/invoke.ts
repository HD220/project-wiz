import { z } from "zod";
import { sendChannelMessage } from "@/main/ipc/channel/queries";
import { MessageSchema } from "@/shared/types";
import { requireAuth } from "@/main/services/session-registry";
import { getLogger } from "@/shared/services/logger/config";

const logger = getLogger("channel.send-message.invoke");

// Input schema - apenas campos de negócio (sourceType será fixo como "channel")
const SendChannelMessageInputSchema = MessageSchema.pick({
  sourceId: true,
  content: true
});

// Output schema
const SendChannelMessageOutputSchema = MessageSchema;

type SendChannelMessageInput = z.infer<typeof SendChannelMessageInputSchema>;
type SendChannelMessageOutput = z.infer<typeof SendChannelMessageOutputSchema>;

export default async function(input: SendChannelMessageInput): Promise<SendChannelMessageOutput> {
  logger.debug("Sending message to channel", { channelId: input.sourceId });

  // 1. Validate input
  const validatedInput = SendChannelMessageInputSchema.parse(input);

  // 2. Check authentication
  const currentUser = requireAuth();
  
  // 3. Send message to channel
  const messageData = {
    sourceType: "channel" as const,
    sourceId: validatedInput.sourceId,
    ownerId: currentUser.id, // Use ownerId for database consistency
    content: validatedInput.content,
    isActive: true
  };
  
  const dbMessage = await sendChannelMessage(messageData);
  
  // 4. Map database result to shared type
  const apiMessage = {
    id: dbMessage.id,
    sourceType: dbMessage.sourceType,
    sourceId: dbMessage.sourceId,
    authorId: dbMessage.ownerId, // Map ownerId to authorId for API consistency
    content: dbMessage.content,
    createdAt: new Date(dbMessage.createdAt),
    updatedAt: new Date(dbMessage.updatedAt),
  };
  
  // 5. Validate output
  const result = SendChannelMessageOutputSchema.parse(apiMessage);
  
  logger.debug("Message sent to channel", { 
    channelId: input.sourceId, 
    messageId: result.id 
  });
  
  return result;
}

declare global {
  namespace WindowAPI {
    interface Channel {
      sendMessage: (input: SendChannelMessageInput) => Promise<SendChannelMessageOutput>
    }
  }
}