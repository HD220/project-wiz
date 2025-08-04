import { eq, and } from "drizzle-orm";
import { createDatabaseConnection } from "@/shared/database/config";
import { 
  projectChannelsTable,
  type SelectProjectChannel,
  type InsertProjectChannel
} from "@/main/database/schemas/project-channel.schema";
import { projectsTable } from "@/main/database/schemas/project.schema";

const { getDatabase } = createDatabaseConnection(true);

/**
 * Pure database function - only Drizzle types
 * No validation, no business logic, just database operations
 */
export async function createChannel(data: InsertProjectChannel): Promise<SelectProjectChannel> {
  const db = getDatabase();

  // Usar transação síncrona conforme o padrão do service original
  const result = db.transaction((tx) => {
    // 1. Verificar se o projeto existe e está ativo
    const projectResults = tx
      .select()
      .from(projectsTable)
      .where(
        and(
          eq(projectsTable.id, data.projectId),
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
      .values(data)
      .returning()
      .all();

    const [channel] = channelResults;
    if (!channel) {
      throw new Error("Failed to create project channel");
    }

    return channel;
  });

  return result;
}