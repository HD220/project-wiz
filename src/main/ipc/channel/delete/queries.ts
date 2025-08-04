import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { createDatabaseConnection } from "@/shared/database/config";
import { 
  projectChannelsTable
} from "@/main/database/schemas/project-channel.schema";
import { messagesTable } from "@/main/database/schemas/message.schema";

const { getDatabase } = createDatabaseConnection(true);

// Input validation schema
export const DeleteChannelInputSchema = z.object({
  channelId: z.string().min(1, "Channel ID is required"),
  deletedBy: z.string().min(1, "Deleted by user ID is required")
});

// Output validation schema
export const DeleteChannelOutputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

export type DeleteChannelInput = z.infer<typeof DeleteChannelInputSchema>;
export type DeleteChannelOutput = z.infer<typeof DeleteChannelOutputSchema>;

export async function deleteChannel(input: DeleteChannelInput): Promise<DeleteChannelOutput> {
  const db = getDatabase();
  
  const validatedInput = DeleteChannelInputSchema.parse(input);

  return db.transaction((tx) => {
    // 1. Verificar se o channel existe e está ativo
    const channelResults = tx
      .select()
      .from(projectChannelsTable)
      .where(
        and(
          eq(projectChannelsTable.id, validatedInput.channelId),
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
        deactivatedBy: validatedInput.deletedBy,
        updatedAt: new Date(),
      })
      .where(eq(projectChannelsTable.id, validatedInput.channelId))
      .run();

    // 3. Soft delete de todas as mensagens relacionadas
    tx.update(messagesTable)
      .set({
        isActive: false,
        deactivatedAt: new Date(),
        deactivatedBy: validatedInput.deletedBy,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(messagesTable.sourceId, validatedInput.channelId),
          eq(messagesTable.sourceType, "channel"),
          eq(messagesTable.isActive, true),
        ),
      )
      .run();

    return DeleteChannelOutputSchema.parse({
      success: true,
      message: "Channel deleted successfully"
    });
  });
}