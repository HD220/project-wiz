import { z } from "zod";
import { getDMMessages } from "@/main/ipc/dm/queries";
import { MessageSchema } from "@/shared/types";
import { requireAuth } from "@/main/services/session-registry";
import { getLogger } from "@/shared/services/logger/config";

const logger = getLogger("dm.get-messages.invoke");

// Input schema
const GetDMMessagesInputSchema = z.object({
  dmId: z.string(),
  limit: z.number().optional(),
});

// Output schema - array de Message
const GetDMMessagesOutputSchema = z.array(MessageSchema);

type GetDMMessagesInput = z.infer<typeof GetDMMessagesInputSchema>;
type GetDMMessagesOutput = z.infer<typeof GetDMMessagesOutputSchema>;

export default async function(input: GetDMMessagesInput): Promise<GetDMMessagesOutput> {
  logger.debug("Getting DM messages", { dmId: input.dmId });

  // 1. Validate input
  const validatedInput = GetDMMessagesInputSchema.parse(input);

  // 2. Check authentication
  const currentUser = requireAuth();
  
  // 3. Query recebe dados e gerencia campos técnicos internamente
  const dbMessages = await getDMMessages(validatedInput.dmId, {
    limit: validatedInput.limit,
  });
  
  // 4. Mapeamento: SelectMessage[] → Message[] (sem campos técnicos)
  const apiMessages = dbMessages.map(message => ({
    id: message.id,
    sourceType: message.sourceType,
    sourceId: message.sourceId,
    authorId: message.authorId,       
    content: message.content,
    createdAt: new Date(message.createdAt),
    updatedAt: new Date(message.updatedAt),
  }));
  
  // 5. Validate output
  const result = GetDMMessagesOutputSchema.parse(apiMessages);
  
  logger.debug("Retrieved DM messages", { count: result.length, dmId: input.dmId });
  
  return result;
}

declare global {
  namespace WindowAPI {
    interface Dm {
      getMessages: (input: GetDMMessagesInput) => Promise<GetDMMessagesOutput>
    }
  }
}
