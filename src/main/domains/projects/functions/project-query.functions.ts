import { eq } from "drizzle-orm";

import { getDatabase } from "../../../infrastructure/database";
import { getLogger } from "../../../infrastructure/logger";
import {
  projects,
  type ProjectSchema,
} from "../../../persistence/schemas/projects.schema";

const logger = getLogger("projects.query");

export async function findProjectById(
  id: string,
): Promise<ProjectSchema | null> {
  try {
    const db = getDatabase();
    const results = await db.select().from(projects).where(eq(projects.id, id));

    if (results.length === 0) {
      logger.warn(`Project not found: ${id}`);
      return null;
    }

    return results[0];
  } catch (error) {
    logger.error("Failed to find project by ID", { error, id });
    throw error;
  }
}

export async function findAllProjects(filter?: {
  status?: "active" | "inactive" | "archived";
  limit?: number;
  offset?: number;
}): Promise<ProjectSchema[]> {
  try {
    const db = getDatabase();
    const results = await getFilteredProjects(db, filter);
    
    logger.info(`Found ${results.length} projects with filter:`, filter);
    return results;
  } catch (error) {
    logger.error("Failed to find projects", { error, filter });
    throw error;
  }
}

async function getFilteredProjects(db: any, filter?: {
  status?: "active" | "inactive" | "archived";
  limit?: number;
  offset?: number;
}) {
  if (filter?.status) {
    return await db
      .select()
      .from(projects)
      .where(eq(projects.status, filter.status))
      .limit(filter.limit || 1000)
      .offset(filter.offset || 0);
  }

  return await db
    .select()
    .from(projects)
    .limit(filter?.limit || 1000)
    .offset(filter?.offset || 0);
}