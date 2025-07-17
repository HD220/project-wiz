import { eq, desc } from "drizzle-orm";
import { getDatabase } from "../../../infrastructure/database";
import { getLogger } from "../../../infrastructure/logger";
import { projects } from "../../../persistence/schemas/projects.schema";
import { Project } from "../project.entity";
import { createProjectFromDbData } from "./project.mapper";

const logger = getLogger("projects");

export async function findProjectById(id: string): Promise<Project | null> {
  try {
    const db = getDatabase();
    const result = await db
      .select()
      .from(projects)
      .where(eq(projects.id, id))
      .limit(1);

    return result.length > 0 ? createProjectFromDbData(result[0]) : null;
  } catch (error) {
    logger.error("Failed to find project", { error, id });
    throw error;
  }
}

export async function findAllProjects(): Promise<Project[]> {
  try {
    const db = getDatabase();
    const result = await db
      .select()
      .from(projects)
      .orderBy(desc(projects.updatedAt));

    return result.map(createProjectFromDbData);
  } catch (error) {
    logger.error("Failed to find projects", { error });
    throw error;
  }
}
