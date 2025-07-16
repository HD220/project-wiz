import { eq } from "drizzle-orm";

import { getDatabase } from "../../../infrastructure/database";
import { getLogger } from "../../../infrastructure/logger";
import {
  projects,
  type ProjectSchema,
} from "../../../persistence/schemas/projects.schema";
import { Project } from "../entities";
import { findProjectById } from "./project-query.functions";

const logger = getLogger("projects.update");

export async function updateProject(data: {
  id: string;
  name?: string;
  description?: string | null;
  gitUrl?: string | null;
}): Promise<ProjectSchema> {
  try {
    const existing = await findProjectById(data.id);
    if (!existing) {
      throw new Error("Project not found");
    }

    const project = new Project(existing);
    applyProjectUpdates(project, data);

    const db = getDatabase();
    const updated = await db
      .update(projects)
      .set(project.toPlainObject())
      .where(eq(projects.id, data.id))
      .returning();

    logger.info(`Project updated: ${data.id}`);
    return updated[0];
  } catch (error) {
    logger.error("Failed to update project", { error, data });
    throw error;
  }
}

function applyProjectUpdates(project: Project, data: {
  name?: string;
  description?: string | null;
  gitUrl?: string | null;
}) {
  if (data.name !== undefined) {
    project.updateName(data.name);
  }
  if (data.description !== undefined) {
    project.updateDescription(data.description);
  }
  if (data.gitUrl !== undefined) {
    project.updateGitUrl(data.gitUrl);
  }
}

export async function deleteProject(id: string): Promise<void> {
  try {
    const existing = await findProjectById(id);
    if (!existing) {
      throw new Error("Project not found");
    }

    const db = getDatabase();
    await db.delete(projects).where(eq(projects.id, id));
    logger.info(`Project deleted: ${id}`);
  } catch (error) {
    logger.error("Failed to delete project", { error, id });
    throw error;
  }
}