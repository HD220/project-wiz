import { eq, and, inArray, isNull } from "drizzle-orm";
import { createDatabaseConnection } from "@/shared/database/config";
import { 
  dmConversationsTable,
  dmParticipantsTable,
  type SelectDMConversation,
  type SelectDMParticipant 
} from "@/main/database/schemas/dm-conversation.schema";
import { messagesTable } from "@/main/database/schemas/message.schema";
import type { GetUserConversationsInput, GetUserConversationsOutput } from "@/shared/types/dm-conversation";

const { getDatabase } = createDatabaseConnection(true);

export async function getUserConversations(input: GetUserConversationsInput): Promise<GetUserConversationsOutput> {
  const db = getDatabase();
  
  const { userId, includeInactive, includeArchived } = input;

  // 1. Buscar DM conversations onde o usuário é participante
  const participantConditions = [
    eq(dmParticipantsTable.participantId, userId),
  ];

  if (!includeInactive) {
    participantConditions.push(eq(dmParticipantsTable.isActive, true));
  }

  const userDMConversations = await db
    .select({
      dmConversationId: dmParticipantsTable.dmConversationId,
    })
    .from(dmParticipantsTable)
    .where(and(...participantConditions));

  const dmConversationIds = userDMConversations.map(
    (userConv) => userConv.dmConversationId,
  );

  if (dmConversationIds.length === 0) {
    return [];
  }

  // 2. Buscar as conversations com filtros
  const conversationConditions = [
    inArray(dmConversationsTable.id, dmConversationIds),
  ];

  if (!includeInactive) {
    conversationConditions.push(eq(dmConversationsTable.isActive, true));
  }

  if (!includeArchived) {
    conversationConditions.push(isNull(dmConversationsTable.archivedAt));
  }

  const dmConversations = await db
    .select()
    .from(dmConversationsTable)
    .where(and(...conversationConditions));

  // 3. Buscar todos os participantes dessas conversations
  const participantQueryConditions = [
    inArray(dmParticipantsTable.dmConversationId, dmConversationIds),
  ];

  if (!includeInactive) {
    participantQueryConditions.push(eq(dmParticipantsTable.isActive, true));
  }

  const allParticipants = await db
    .select()
    .from(dmParticipantsTable)
    .where(and(...participantQueryConditions));

  // 4. Buscar últimas mensagens
  const messageConditions = [
    inArray(messagesTable.sourceId, dmConversationIds),
    eq(messagesTable.sourceType, "dm" as const),
  ];

  if (!includeInactive) {
    messageConditions.push(eq(messagesTable.isActive, true));
  }

  const latestMessages = await db
    .select({
      id: messagesTable.id,
      content: messagesTable.content,
      authorId: messagesTable.authorId,
      sourceId: messagesTable.sourceId,
      createdAt: messagesTable.createdAt,
      updatedAt: messagesTable.updatedAt,
    })
    .from(messagesTable)
    .where(and(...messageConditions));

  // 5. Combinar dados
  const result = dmConversations.map((conversation) => {
    const conversationParticipants = allParticipants.filter(
      (participant) => participant.dmConversationId === conversation.id,
    );

    // Encontrar última mensagem desta conversation
    const conversationMessages = latestMessages.filter(
      (message) => message.sourceId === conversation.id,
    );
    
    const lastMessage = conversationMessages.length > 0 
      ? conversationMessages.reduce((latest, current) => 
          current.createdAt > latest.createdAt ? current : latest
        )
      : undefined;

    return {
      ...conversation,
      participants: conversationParticipants,
      lastMessage: lastMessage ? {
        id: lastMessage.id,
        content: lastMessage.content,
        authorId: lastMessage.authorId,
        createdAt: lastMessage.createdAt,
        updatedAt: lastMessage.updatedAt,
      } : undefined,
    };
  });

  return result;
}