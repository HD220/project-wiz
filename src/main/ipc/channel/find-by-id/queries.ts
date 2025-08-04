import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { createDatabaseConnection } from "@/shared/database/config";
import { 
  projectChannelsTable,
  type SelectProjectChannel 
} from "@/main/database/schemas/project-channel.schema";

const { getDatabase } = createDatabaseConnection(true);

// Input validation schema
export const FindChannelByIdInputSchema = z.object({
  id: z.string().min(1, "Channel ID is required"),
  includeInactive: z.boolean().optional().default(false),
});

// Output validation schema
export const FindChannelByIdOutputSchema = z.object({
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
}).nullable();

export type FindChannelByIdInput = z.infer<typeof FindChannelByIdInputSchema>;
export type FindChannelByIdOutput = z.infer<typeof FindChannelByIdOutputSchema>;

export async function findChannelById(input: FindChannelByIdInput): Promise<FindChannelByIdOutput> {
  const db = getDatabase();
  
  const validatedInput = FindChannelByIdInputSchema.parse(input);
  const { id, includeInactive } = validatedInput;

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

  return FindChannelByIdOutputSchema.parse(channel);
}