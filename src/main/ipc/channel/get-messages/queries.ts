import { z } from "zod";
import { eq, and, asc } from "drizzle-orm";
import { createDatabaseConnection } from "@/shared/database/config";
import { messagesTable, type SelectMessage } from "@/main/database/schemas/message.schema";

const { getDatabase } = createDatabaseConnection(true);

// Input validation schema
export const GetChannelMessagesInputSchema = z.object({
  channelId: z.string().min(1, "Channel ID is required"),
  includeInactive: z.boolean().optional().default(false)
});

// Output validation schema - array of messages
export const GetChannelMessagesOutputSchema = z.array(z.object({
  id: z.string(),
  sourceType: z.string(),
  sourceId: z.string(),
  authorId: z.string(),
  content: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  isActive: z.boolean(),
  deactivatedAt: z.date().nullable(),
  deactivatedBy: z.string().nullable()
}));

export type GetChannelMessagesInput = z.infer<typeof GetChannelMessagesInputSchema>;
export type GetChannelMessagesOutput = z.infer<typeof GetChannelMessagesOutputSchema>;

export async function getChannelMessages(input: GetChannelMessagesInput): Promise<GetChannelMessagesOutput> {
  const db = getDatabase();
  
  const validatedInput = GetChannelMessagesInputSchema.parse(input);

  const conditions = [
    eq(messagesTable.sourceType, "channel"),
    eq(messagesTable.sourceId, validatedInput.channelId),
  ];

  if (!validatedInput.includeInactive) {
    conditions.push(eq(messagesTable.isActive, true));
  }

  const messages = await db
    .select()
    .from(messagesTable)
    .where(and(...conditions))
    .orderBy(asc(messagesTable.createdAt));

  return GetChannelMessagesOutputSchema.parse(messages);
}