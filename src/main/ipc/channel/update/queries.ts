import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { createDatabaseConnection } from "@/shared/database/config";
import { 
  projectChannelsTable,
  type SelectProjectChannel 
} from "@/main/database/schemas/project-channel.schema";

const { getDatabase } = createDatabaseConnection(true);

// Input validation schema
export const UpdateChannelInputSchema = z.object({
  channelId: z.string().min(1, "Channel ID is required"),
  name: z.string().min(1, "Channel name is required").optional(),
  description: z.string().optional(),
});

// Output validation schema
export const UpdateChannelOutputSchema = z.object({
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
});

export type UpdateChannelInput = z.infer<typeof UpdateChannelInputSchema>;
export type UpdateChannelOutput = z.infer<typeof UpdateChannelOutputSchema>;

export async function updateChannel(input: UpdateChannelInput): Promise<UpdateChannelOutput> {
  const db = getDatabase();
  
  const validatedInput = UpdateChannelInputSchema.parse(input);
  const { channelId, ...updates } = validatedInput;

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

  return UpdateChannelOutputSchema.parse(updated);
}