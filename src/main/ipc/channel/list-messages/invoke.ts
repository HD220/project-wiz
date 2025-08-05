import { z } from "zod";
import { getChannelMessages } from "@/main/ipc/channel/queries";
import { MessageSchema } from "@/shared/types";
import { requireAuth } from "@/main/services/session-registry";
import { getLogger } from "@/shared/services/logger/config";

const logger = getLogger("channel.get-messages.invoke");

// Input schema
const GetChannelMessagesInputSchema = z.object({
  channelId: z.string(),
  limit: z.number().optional()
});

// Output schema - array de Message
const GetChannelMessagesOutputSchema = z.array(MessageSchema);

type GetChannelMessagesInput = z.infer<typeof GetChannelMessagesInputSchema>;
type GetChannelMessagesOutput = z.infer<typeof GetChannelMessagesOutputSchema>;

export default async function(input: GetChannelMessagesInput): Promise<GetChannelMessagesOutput> {
  logger.debug("Getting channel messages", { channelId: input.channelId });

  // 1. Validate input
  const validatedInput = GetChannelMessagesInputSchema.parse(input);

  // 2. Check authentication
  const currentUser = requireAuth();
  
  // 3. Query recebe dados e gerencia campos técnicos internamente
  const dbMessages = await getChannelMessages(validatedInput.channelId, { limit: validatedInput.limit });
  
  // 4. Mapeamento: SelectMessage[] → Message[] (sem campos técnicos)
  const apiMessages = dbMessages.map(message => ({
    id: message.id,
    sourceType: message.sourceType as "channel",
    sourceId: message.sourceId,
    authorId: message.ownerId, // Map ownerId to authorId for API consistency
    content: message.content,
    createdAt: new Date(message.createdAt),
    updatedAt: new Date(message.updatedAt),
  }));
  
  // 5. Validate output
  const result = GetChannelMessagesOutputSchema.parse(apiMessages);
  
  logger.debug("Channel messages retrieved", { 
    channelId: validatedInput.channelId, 
    messageCount: result.length 
  });
  
  return result;
}

declare global {
  namespace WindowAPI {
    interface Channel {
      getMessages: (input: GetChannelMessagesInput) => Promise<GetChannelMessagesOutput>
    }
  }
}