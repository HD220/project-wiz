import { eq } from "drizzle-orm";

import { getDatabase } from "../../../infrastructure/database";
import { getLogger } from "../../../infrastructure/logger";
import {
  projects,
  type ProjectSchema,
} from "../../../persistence/schemas/projects.schema";
import { Project } from "../entities";
import { findProjectById } from "./project-crud.functions";

const logger = getLogger("projects.operations");

export async function findProjectsByStatus(
  status: "active" | "inactive" | "archived" = "active",
): Promise<ProjectSchema[]> {
  try {
    const db = getDatabase();
    const results = await db
      .select()
      .from(projects)
      .where(eq(projects.status, status));

    logger.info(`Found ${results.length} projects with status: ${status}`);
    return results;
  } catch (error) {
    logger.error("Failed to find projects by status", { error, status });
    throw error;
  }
}

export async function archiveProject(id: string): Promise<ProjectSchema> {
  try {
    const existing = await findProjectById(id);
    if (!existing) {
      throw new Error("Project not found");
    }

    const project = new Project(existing);
    project.archive();

    const db = getDatabase();
    const updated = await db
      .update(projects)
      .set(project.toPlainObject())
      .where(eq(projects.id, id))
      .returning();

    logger.info(`Project archived: ${id}`);
    return updated[0];
  } catch (error) {
    logger.error("Failed to archive project", { error, id });
    throw error;
  }
}