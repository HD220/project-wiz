import { eq, and } from "drizzle-orm";
import { createDatabaseConnection } from "@/shared/database/config";
import { 
  projectChannelsTable
} from "@/main/database/schemas/project-channel.schema";
import { messagesTable } from "@/main/database/schemas/message.schema";
import type { DeleteChannelInput, DeleteChannelOutput } from "@/shared/types/channel";

const { getDatabase } = createDatabaseConnection(true);

export async function deleteChannel(input: DeleteChannelInput): Promise<DeleteChannelOutput> {
  const db = getDatabase();

  return db.transaction((tx) => {
    // 1. Verificar se o channel existe e está ativo
    const channelResults = tx
      .select()
      .from(projectChannelsTable)
      .where(
        and(
          eq(projectChannelsTable.id, input.channelId),
          eq(projectChannelsTable.isActive, true),
        ),
      )
      .limit(1)
      .all();

    const [channel] = channelResults;
    if (!channel) {
      throw new Error("Channel not found or already inactive");
    }

    // 2. Soft delete do channel
    tx.update(projectChannelsTable)
      .set({
        isActive: false,
        deactivatedAt: new Date(),
        deactivatedBy: input.deletedBy,
        updatedAt: new Date(),
      })
      .where(eq(projectChannelsTable.id, input.channelId))
      .run();

    // 3. Soft delete de todas as mensagens relacionadas
    tx.update(messagesTable)
      .set({
        isActive: false,
        deactivatedAt: new Date(),
        deactivatedBy: input.deletedBy,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(messagesTable.sourceId, input.channelId),
          eq(messagesTable.sourceType, "channel"),
          eq(messagesTable.isActive, true),
        ),
      )
      .run();

    return {
      success: true,
      message: "Channel deleted successfully"
    };
  });
}