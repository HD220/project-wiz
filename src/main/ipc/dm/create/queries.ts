import { z } from "zod";
import { eq, inArray } from "drizzle-orm";
import { createDatabaseConnection } from "@/shared/database/config";
import { 
  dmConversationsTable,
  dmParticipantsTable,
  type SelectDMConversation,
  type SelectDMParticipant 
} from "@/main/database/schemas/dm-conversation.schema";
import { usersTable } from "@/main/database/schemas/user.schema";

const { getDatabase } = createDatabaseConnection(true);

// Input validation schema
export const CreateDMInputSchema = z.object({
  participantIds: z.array(z.string().min(1, "Participant ID is required")).min(1, "At least one participant is required"),
  currentUserId: z.string().min(1, "Current user ID is required"),
  description: z.string().optional(),
});

// Output validation schema
export const CreateDMOutputSchema = z.object({
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
});

export type CreateDMInput = z.infer<typeof CreateDMInputSchema>;
export type CreateDMOutput = z.infer<typeof CreateDMOutputSchema>;

// Função para gerar título da DM (replicando do service original)
async function generateDMTitle(
  participantIds: string[],
  currentUserId?: string,
): Promise<string> {
  const otherParticipantIds = currentUserId
    ? participantIds.filter((id) => id !== currentUserId)
    : participantIds;

  if (otherParticipantIds.length === 0) {
    return "Self Conversation";
  }

  const participantNames: string[] = [];
  for (const participantId of otherParticipantIds) {
    const db = getDatabase();
    const [user] = await db
      .select({ name: usersTable.name })
      .from(usersTable)
      .where(eq(usersTable.id, participantId))
      .limit(1);
    if (user) {
      participantNames.push(user.name);
    }
  }

  if (participantNames.length === 0) {
    return "Unknown Participants";
  }

  if (participantNames.length <= 3) {
    return participantNames.join(", ");
  }

  return `${participantNames.slice(0, 3).join(", ")}...`;
}

export async function createDM(input: CreateDMInput): Promise<CreateDMOutput> {
  const db = getDatabase();
  
  const validatedInput = CreateDMInputSchema.parse(input);

  // Validar que todos os participant IDs existem
  const existingUsers = await db
    .select({ id: usersTable.id, name: usersTable.name })
    .from(usersTable)
    .where(inArray(usersTable.id, validatedInput.participantIds));

  const existingUserIds = new Set(existingUsers.map((user) => user.id));
  const invalidParticipantIds = validatedInput.participantIds.filter(
    (id) => !existingUserIds.has(id),
  );

  if (invalidParticipantIds.length > 0) {
    throw new Error(
      `Invalid participant IDs: ${invalidParticipantIds.join(", ")}`,
    );
  }

  const conversationName = await generateDMTitle(
    validatedInput.participantIds,
    validatedInput.currentUserId,
  );

  // Usar transação síncrona conforme o padrão do service original
  const result = db.transaction((tx) => {
    // 1. Criar DM conversation
    const dmConversationResults = tx
      .insert(dmConversationsTable)
      .values({
        name: conversationName,
        description: validatedInput.description,
      })
      .returning()
      .all();

    const [dmConversation] = dmConversationResults;
    if (!dmConversation) {
      throw new Error("Failed to create DM conversation");
    }

    // 2. Adicionar participantes
    const participantValues = validatedInput.participantIds.map((participantId) => ({
      dmConversationId: dmConversation.id,
      participantId,
    }));

    const participantsResults = tx
      .insert(dmParticipantsTable)
      .values(participantValues)
      .returning()
      .all();

    return {
      ...dmConversation,
      participants: participantsResults,
    };
  });

  return CreateDMOutputSchema.parse(result);
}