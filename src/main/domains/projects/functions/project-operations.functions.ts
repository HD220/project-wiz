import { getDatabase } from "../../../infrastructure/database";
import { getLogger } from "../../../infrastructure/logger";
import {
  projects,
  type ProjectSchema,
} from "../../../persistence/schemas/projects.schema";
import { eq } from "drizzle-orm";

const logger = getLogger("projects.operations");

export async function deleteProject(id: string): Promise<void> {
  try {
    const db = getDatabase();

    const deleted = await db
      .delete(projects)
      .where(eq(projects.id, id))
      .returning();

    if (deleted.length === 0) {
      throw new Error(`Project not found: ${id}`);
    }

    logger.info(`Project deleted: ${id}`);
  } catch (error) {
    logger.error("Failed to delete project", { error, id });
    throw error;
  }
}

export async function archiveProject(id: string): Promise<ProjectSchema> {
  try {
    const db = getDatabase();

    const archived = await db
      .update(projects)
      .set({
        status: "archived",
        updatedAt: new Date(),
      })
      .where(eq(projects.id, id))
      .returning();

    if (archived.length === 0) {
      throw new Error(`Project not found: ${id}`);
    }

    logger.info(`Project archived: ${id}`);
    return archived[0];
  } catch (error) {
    logger.error("Failed to archive project", { error, id });
    throw error;
  }
}
