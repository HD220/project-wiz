import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { createDatabaseConnection } from "@/shared/database/config";
import { 
  dmConversationsTable,
  dmParticipantsTable,
  type SelectDMConversation,
  type SelectDMParticipant 
} from "@/main/database/schemas/dm-conversation.schema";

const { getDatabase } = createDatabaseConnection(true);

// Input validation schema
export const FindDMByIdInputSchema = z.object({
  id: z.string().min(1, "DM ID is required"),
  includeInactive: z.boolean().optional().default(false),
});

// Output validation schema
export const FindDMByIdOutputSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  isArchived: z.boolean(),
  isActive: z.boolean(),
  deactivatedAt: z.number().nullable(),
  deactivatedBy: z.string().nullable(),
  createdAt: z.number(),
  updatedAt: z.number(),
  participants: z.array(z.object({
    id: z.string(),
    dmConversationId: z.string(),
    participantId: z.string(),
    isActive: z.boolean(),
    deactivatedAt: z.number().nullable(),
    deactivatedBy: z.string().nullable(),
    createdAt: z.number(),
    updatedAt: z.number(),
  })),
}).nullable();

export type FindDMByIdInput = z.infer<typeof FindDMByIdInputSchema>;
export type FindDMByIdOutput = z.infer<typeof FindDMByIdOutputSchema>;

export async function findDMById(input: FindDMByIdInput): Promise<FindDMByIdOutput> {
  const db = getDatabase();
  
  const validatedInput = FindDMByIdInputSchema.parse(input);
  const { id, includeInactive } = validatedInput;

  // 1. Buscar a DM conversation
  const conversationConditions = [eq(dmConversationsTable.id, id)];

  if (!includeInactive) {
    conversationConditions.push(eq(dmConversationsTable.isActive, true));
  }

  const [dmConversation] = await db
    .select()
    .from(dmConversationsTable)
    .where(and(...conversationConditions))
    .limit(1);

  if (!dmConversation) {
    return null;
  }

  // 2. Buscar os participantes
  const participantConditions = [
    eq(dmParticipantsTable.dmConversationId, id),
  ];

  if (!includeInactive) {
    participantConditions.push(eq(dmParticipantsTable.isActive, true));
  }

  const participants = await db
    .select()
    .from(dmParticipantsTable)
    .where(and(...participantConditions));

  const result = {
    ...dmConversation,
    participants,
  };

  return FindDMByIdOutputSchema.parse(result);
}