import { eq, and } from "drizzle-orm";
import { createDatabaseConnection } from "@/shared/database/config";
import { 
  projectChannelsTable,
  type SelectProjectChannel 
} from "@/main/database/schemas/project-channel.schema";
import type { UpdateChannelInput, UpdateChannelOutput } from "@/shared/types/channel";

const { getDatabase } = createDatabaseConnection(true);

export async function updateChannel(input: UpdateChannelInput): Promise<UpdateChannelOutput> {
  const db = getDatabase();
  
  const { channelId, ...updates } = input;

  // Atualizar channel (replicando projectChannelService.updateChannel)
  const [updated] = await db
    .update(projectChannelsTable)
    .set({
      ...updates,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(projectChannelsTable.id, channelId),
        eq(projectChannelsTable.isActive, true),
      ),
    )
    .returning();

  if (!updated) {
    throw new Error("Channel not found, inactive, or update failed");
  }

  return updated;
}