import { eq, and } from "drizzle-orm";
import { createDatabaseConnection } from "@/shared/database/config";
import { 
  projectChannelsTable
} from "@/main/database/schemas/project-channel.schema";
import type { UnarchiveChannelInput, UnarchiveChannelOutput } from "@/shared/types/channel";

const { getDatabase } = createDatabaseConnection(true);

export async function unarchiveChannel(channelId: UnarchiveChannelInput): Promise<UnarchiveChannelOutput> {
  const db = getDatabase();

  // 1. Verificar se o channel existe e está arquivado
  const [channel] = await db
    .select()
    .from(projectChannelsTable)
    .where(
      and(
        eq(projectChannelsTable.id, channelId),
        eq(projectChannelsTable.isActive, true),
      ),
    )
    .limit(1);

  if (!channel) {
    throw new Error("Channel not found or inactive");
  }

  if (!channel.archivedAt) {
    throw new Error("Channel is not archived");
  }

  // 2. Desarquivar o channel
  const [updated] = await db
    .update(projectChannelsTable)
    .set({
      archivedAt: null,
      archivedBy: null,
      updatedAt: new Date(),
    })
    .where(eq(projectChannelsTable.id, channelId))
    .returning();

  if (!updated) {
    throw new Error("Failed to unarchive channel");
  }

  return {
    success: true,
    message: "Channel unarchived successfully"
  };
}