import { z } from "zod";
import { eq, and, isNull } from "drizzle-orm";
import { createDatabaseConnection } from "@/shared/database/config";
import { 
  projectChannelsTable
} from "@/main/database/schemas/project-channel.schema";

const { getDatabase } = createDatabaseConnection(true);

// Input validation schema
export const ArchiveChannelInputSchema = z.object({
  channelId: z.string().min(1, "Channel ID is required"),
  archivedBy: z.string().min(1, "Archived by user ID is required"),
});

// Output validation schema
export const ArchiveChannelOutputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

export type ArchiveChannelInput = z.infer<typeof ArchiveChannelInputSchema>;
export type ArchiveChannelOutput = z.infer<typeof ArchiveChannelOutputSchema>;

export async function archiveChannel(input: ArchiveChannelInput): Promise<ArchiveChannelOutput> {
  const db = getDatabase();
  
  const validatedInput = ArchiveChannelInputSchema.parse(input);
  const { channelId, archivedBy } = validatedInput;

  // 1. Verificar se o channel existe e pode ser arquivado
  const [channel] = await db
    .select()
    .from(projectChannelsTable)
    .where(
      and(
        eq(projectChannelsTable.id, channelId),
        eq(projectChannelsTable.isActive, true),
        isNull(projectChannelsTable.archivedAt),
      ),
    )
    .limit(1);

  if (!channel) {
    throw new Error("Channel not found, inactive, or already archived");
  }

  // 2. Arquivar o channel
  const [updated] = await db
    .update(projectChannelsTable)
    .set({
      archivedAt: new Date(),
      archivedBy,
      updatedAt: new Date(),
    })
    .where(eq(projectChannelsTable.id, channelId))
    .returning();

  if (!updated) {
    throw new Error("Failed to archive channel");
  }

  return ArchiveChannelOutputSchema.parse({
    success: true,
    message: "Channel archived successfully"
  });
}