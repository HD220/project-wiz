import { eq, and, isNull } from "drizzle-orm";
import { createDatabaseConnection } from "@/shared/database/config";
import { 
  projectChannelsTable
} from "@/main/database/schemas/project-channel.schema";
import type { ArchiveChannelInput, ArchiveChannelOutput } from "@/shared/types/channel";

const { getDatabase } = createDatabaseConnection(true);

export async function archiveChannel(input: ArchiveChannelInput): Promise<ArchiveChannelOutput> {
  const db = getDatabase();
  
  const { channelId, archivedBy } = input;

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

  return {
    success: true,
    message: "Channel archived successfully"
  };
}