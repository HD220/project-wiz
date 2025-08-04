import { z } from "zod";
import { eq, and, desc, sql, isNull, inArray } from "drizzle-orm";
import { createDatabaseConnection } from "@/shared/database/config";
import { 
  projectChannelsTable,
  type SelectProjectChannel 
} from "@/main/database/schemas/project-channel.schema";
import { messagesTable } from "@/main/database/schemas/message.schema";

const { getDatabase } = createDatabaseConnection(true);

// Input validation schema
export const GetProjectChannelsInputSchema = z.object({
  projectId: z.string().min(1, "Project ID is required"),
  includeInactive: z.boolean().optional().default(false),
  includeArchived: z.boolean().optional().default(false),
});

// Output validation schema (com última mensagem)
export const GetProjectChannelsOutputSchema = z.array(z.object({
  id: z.string(),
  projectId: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  isArchived: z.boolean(),
  isActive: z.boolean(),
  deactivatedAt: z.number().nullable(),
  deactivatedBy: z.string().nullable(),
  createdAt: z.number(),
  updatedAt: z.number(),
  lastMessage: z.object({
    id: z.string(),
    content: z.string(),
    authorId: z.string(),
    createdAt: z.number(),
    updatedAt: z.number(),
  }).optional(),
}));

export type GetProjectChannelsInput = z.infer<typeof GetProjectChannelsInputSchema>;
export type GetProjectChannelsOutput = z.infer<typeof GetProjectChannelsOutputSchema>;

export async function getProjectChannels(input: GetProjectChannelsInput): Promise<GetProjectChannelsOutput> {
  const db = getDatabase();
  
  const validatedInput = GetProjectChannelsInputSchema.parse(input);
  const { projectId, includeInactive, includeArchived } = validatedInput;

  // 1. Buscar channels do projeto com filtros
  const channelConditions = [eq(projectChannelsTable.projectId, projectId)];

  if (!includeInactive) {
    channelConditions.push(eq(projectChannelsTable.isActive, true));
  }

  if (!includeArchived) {
    channelConditions.push(isNull(projectChannelsTable.archivedAt));
  }

  const channels = await db
    .select()
    .from(projectChannelsTable)
    .where(and(...channelConditions))
    .orderBy(desc(projectChannelsTable.createdAt));

  if (channels.length === 0) {
    return [];
  }

  // 2. Buscar últimas mensagens de cada channel
  const channelIds = channels.map((channel) => channel.id);

  const messageConditions = [
    inArray(messagesTable.sourceId, channelIds),
    eq(messagesTable.sourceType, "channel" as const),
  ];

  if (!includeInactive) {
    messageConditions.push(eq(messagesTable.isActive, true));
  }

  const latestMessages = await db
    .select({
      id: messagesTable.id,
      sourceId: messagesTable.sourceId,
      content: messagesTable.content,
      authorId: messagesTable.authorId,
      createdAt: messagesTable.createdAt,
      updatedAt: messagesTable.updatedAt,
      rn: sql<number>`ROW_NUMBER() OVER (PARTITION BY ${messagesTable.sourceId} ORDER BY ${messagesTable.createdAt} DESC)`.as(
        "rn",
      ),
    })
    .from(messagesTable)
    .where(and(...messageConditions));

  // 3. Mapear últimas mensagens por channel
  const latestMessagesMap = new Map();
  for (const message of latestMessages) {
    if (message.rn === 1) {
      latestMessagesMap.set(message.sourceId, {
        id: message.id,
        content: message.content,
        authorId: message.authorId,
        createdAt: message.createdAt,
        updatedAt: message.updatedAt,
      });
    }
  }

  // 4. Combinar channels com últimas mensagens
  const result = [];
  for (const channel of channels) {
    const lastMessage = latestMessagesMap.get(channel.id);

    result.push({
      ...channel,
      lastMessage: lastMessage || undefined,
    });
  }

  // 5. Ordenar por última atividade
  const sortedResult = result.sort((channelA, channelB) => {
    const aTime = channelA.lastMessage?.createdAt || channelA.updatedAt;
    const bTime = channelB.lastMessage?.createdAt || channelB.updatedAt;
    return new Date(bTime).getTime() - new Date(aTime).getTime();
  });

  return GetProjectChannelsOutputSchema.parse(sortedResult);
}