import { getDatabase } from "../../../infrastructure/database";
import { getLogger } from "../../../infrastructure/logger";
import {
  projects,
  type ProjectSchema,
} from "../../../persistence/schemas/projects.schema";
import { eq } from "drizzle-orm";

const logger = getLogger("projects.update");

export async function updateProject(data: {
  id: string;
  name?: string;
  description?: string | null;
  gitUrl?: string | null;
  status?: string;
  avatar?: string | null;
}): Promise<ProjectSchema> {
  try {
    const db = getDatabase();

    const updateData: Partial<ProjectSchema> = {
      updatedAt: new Date(),
    };

    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined)
      updateData.description = data.description;
    if (data.gitUrl !== undefined) updateData.gitUrl = data.gitUrl;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.avatar !== undefined) updateData.avatar = data.avatar;

    const updated = await db
      .update(projects)
      .set(updateData)
      .where(eq(projects.id, data.id))
      .returning();

    if (updated.length === 0) {
      throw new Error(`Project not found: ${data.id}`);
    }

    logger.info(`Project updated: ${data.id}`);
    return updated[0];
  } catch (error) {
    logger.error("Failed to update project", { error, data });
    throw error;
  }
}
