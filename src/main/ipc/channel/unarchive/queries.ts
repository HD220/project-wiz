import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { createDatabaseConnection } from "@/shared/database/config";
import { 
  projectChannelsTable
} from "@/main/database/schemas/project-channel.schema";

const { getDatabase } = createDatabaseConnection(true);

// Input validation schema
export const UnarchiveChannelInputSchema = z.string().min(1, "Channel ID is required");

// Output validation schema
export const UnarchiveChannelOutputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

export type UnarchiveChannelInput = z.infer<typeof UnarchiveChannelInputSchema>;
export type UnarchiveChannelOutput = z.infer<typeof UnarchiveChannelOutputSchema>;

export async function unarchiveChannel(channelId: UnarchiveChannelInput): Promise<UnarchiveChannelOutput> {
  const db = getDatabase();
  
  const validatedChannelId = UnarchiveChannelInputSchema.parse(channelId);

  // 1. Verificar se o channel existe e está arquivado
  const [channel] = await db
    .select()
    .from(projectChannelsTable)
    .where(
      and(
        eq(projectChannelsTable.id, validatedChannelId),
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
    .where(eq(projectChannelsTable.id, validatedChannelId))
    .returning();

  if (!updated) {
    throw new Error("Failed to unarchive channel");
  }

  return UnarchiveChannelOutputSchema.parse({
    success: true,
    message: "Channel unarchived successfully"
  });
}