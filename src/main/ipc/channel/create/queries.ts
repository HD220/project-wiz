import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { createDatabaseConnection } from "@/shared/database/config";
import { 
  projectChannelsTable,
  type SelectProjectChannel 
} from "@/main/database/schemas/project-channel.schema";
import { projectsTable } from "@/main/database/schemas/project.schema";

const { getDatabase } = createDatabaseConnection(true);

// Input validation schema
export const CreateChannelInputSchema = z.object({
  projectId: z.string().min(1, "Project ID is required"),
  name: z.string().min(1, "Channel name is required"),
  description: z.string().optional(),
});

// Output validation schema
export const CreateChannelOutputSchema = z.object({
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

export type CreateChannelInput = z.infer<typeof CreateChannelInputSchema>;
export type CreateChannelOutput = z.infer<typeof CreateChannelOutputSchema>;

export async function createChannel(input: CreateChannelInput): Promise<CreateChannelOutput> {
  const db = getDatabase();
  
  const validatedInput = CreateChannelInputSchema.parse(input);

  // Usar transação síncrona conforme o padrão do service original
  const result = db.transaction((tx) => {
    // 1. Verificar se o projeto existe e está ativo
    const projectResults = tx
      .select()
      .from(projectsTable)
      .where(
        and(
          eq(projectsTable.id, validatedInput.projectId),
          eq(projectsTable.isActive, true),
        ),
      )
      .limit(1)
      .all();

    const [project] = projectResults;
    if (!project) {
      throw new Error("Project not found or inactive");
    }

    // 2. Criar o channel
    const channelResults = tx
      .insert(projectChannelsTable)
      .values({
        projectId: validatedInput.projectId,
        name: validatedInput.name,
        description: validatedInput.description,
      })
      .returning()
      .all();

    const [channel] = channelResults;
    if (!channel) {
      throw new Error("Failed to create project channel");
    }

    return channel;
  });

  return CreateChannelOutputSchema.parse(result);
}