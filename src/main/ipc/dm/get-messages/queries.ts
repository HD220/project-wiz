import { z } from "zod";
import { eq, and, asc } from "drizzle-orm";
import { createDatabaseConnection } from "@/shared/database/config";
import { 
  messagesTable,
  type SelectMessage 
} from "@/main/database/schemas/message.schema";

const { getDatabase } = createDatabaseConnection(true);

// Input validation schema
export const GetDMMessagesInputSchema = z.object({
  dmId: z.string().min(1, "DM ID is required"),
  includeInactive: z.boolean().optional().default(false),
});

// Output validation schema baseado em SelectMessage[]
export const GetDMMessagesOutputSchema = z.array(z.object({
  id: z.string(),
  sourceType: z.enum(["dm", "channel"]),
  sourceId: z.string(),
  authorId: z.string(),
  content: z.string(),
  isActive: z.boolean(),
  deactivatedAt: z.number().nullable(),
  deactivatedBy: z.string().nullable(),
  createdAt: z.number(),
  updatedAt: z.number(),
}));

export type GetDMMessagesInput = z.infer<typeof GetDMMessagesInputSchema>;
export type GetDMMessagesOutput = z.infer<typeof GetDMMessagesOutputSchema>;

export async function getDMMessages(input: GetDMMessagesInput): Promise<GetDMMessagesOutput> {
  const db = getDatabase();
  
  const validatedInput = GetDMMessagesInputSchema.parse(input);
  const { dmId, includeInactive } = validatedInput;

  // Buscar mensagens da DM (replicando messageService.getDMMessages)
  const conditions = [
    eq(messagesTable.sourceType, "dm"),
    eq(messagesTable.sourceId, dmId),
  ];

  if (!includeInactive) {
    conditions.push(eq(messagesTable.isActive, true));
  }

  const messages = await db
    .select()
    .from(messagesTable)
    .where(and(...conditions))
    .orderBy(asc(messagesTable.createdAt));

  return GetDMMessagesOutputSchema.parse(messages);
}