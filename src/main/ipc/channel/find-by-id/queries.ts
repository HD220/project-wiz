import { eq, and } from "drizzle-orm";
import { createDatabaseConnection } from "@/shared/database/config";
import { 
  projectChannelsTable,
  type SelectProjectChannel 
} from "@/main/database/schemas/project-channel.schema";
import type { FindChannelByIdInput, FindChannelByIdOutput } from "@/shared/types/channel";

const { getDatabase } = createDatabaseConnection(true);

export async function findChannelById(input: FindChannelByIdInput): Promise<FindChannelByIdOutput> {
  const db = getDatabase();
  
  const { id, includeInactive = false } = input;

  // Buscar channel por ID (replicando projectChannelService.findById)
  const channelConditions = [eq(projectChannelsTable.id, id)];

  if (!includeInactive) {
    channelConditions.push(eq(projectChannelsTable.isActive, true));
  }

  const [channel] = await db
    .select()
    .from(projectChannelsTable)
    .where(and(...channelConditions))
    .limit(1);

  if (!channel) {
    return null;
  }

  return channel;
}