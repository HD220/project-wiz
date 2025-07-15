import { eq } from "drizzle-orm";

import { getDatabase } from "../../../infrastructure/database";
import { publishEvent } from "../../../infrastructure/events";
import { getLogger } from "../../../infrastructure/logger";
import { projects as ProjectTable } from "../../../persistence/schemas/projects.schema";
import { Project } from "../entities";

const logger = getLogger("projects.functions");

export async function createProject(data: {
  name: string;
  description?: string | null;
  gitUrl?: string | null;
  createdBy?: string;
}): Promise<any> {
  try {
    const project = new Project({
      name: data.name,
      description: data.description,
      gitUrl: data.gitUrl,
    });

    const db = getDatabase();
    const saved = await db
      .insert(ProjectTable)
      .values(project.toPlainObject())
      .returning();

    logger.info(`Project created: ${project.getId()}`);

    return saved[0];
  } catch (error) {
    logger.error("Failed to create project", { error, data });
    throw error;
  }
}

export async function findProjectById(id: string): Promise<any | null> {
  try {
    const db = getDatabase();
    const results = await db
      .select()
      .from(ProjectTable)
      .where(eq(ProjectTable.id, id));

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

export async function findProjectsByStatus(
  status: "active" | "inactive" | "archived" = "active",
): Promise<any[]> {
  try {
    const db = getDatabase();
    const results = await db
      .select()
      .from(ProjectTable)
      .where(eq(ProjectTable.status, status));

    logger.info(`Found ${results.length} projects with status: ${status}`);
    return results;
  } catch (error) {
    logger.error("Failed to find projects by status", { error, status });
    throw error;
  }
}

export async function findAllProjects(filter?: {
  status?: "active" | "inactive" | "archived";
  limit?: number;
  offset?: number;
}): Promise<any[]> {
  try {
    const db = getDatabase();

    if (filter?.status) {
      const results = await db
        .select()
        .from(ProjectTable)
        .where(eq(ProjectTable.status, filter.status))
        .limit(filter.limit || 1000)
        .offset(filter.offset || 0);

      logger.info(`Found ${results.length} projects with filter:`, filter);
      return results;
    }

    const results = await db
      .select()
      .from(ProjectTable)
      .limit(filter?.limit || 1000)
      .offset(filter?.offset || 0);

    logger.info(`Found ${results.length} projects with filter:`, filter);
    return results;
  } catch (error) {
    logger.error("Failed to find projects", { error, filter });
    throw error;
  }
}

export async function updateProject(data: {
  id: string;
  name?: string;
  description?: string | null;
  gitUrl?: string | null;
}): Promise<any> {
  try {
    const existing = await findProjectById(data.id);
    if (!existing) {
      throw new Error("Project not found");
    }

    const project = new Project(existing);

    if (data.name !== undefined) {
      project.updateName(data.name);
    }
    if (data.description !== undefined) {
      project.updateDescription(data.description);
    }
    if (data.gitUrl !== undefined) {
      project.updateGitUrl(data.gitUrl);
    }

    const db = getDatabase();
    const updated = await db
      .update(ProjectTable)
      .set(project.toPlainObject())
      .where(eq(ProjectTable.id, data.id))
      .returning();

    logger.info(`Project updated: ${data.id}`);

    return updated[0];
  } catch (error) {
    logger.error("Failed to update project", { error, data });
    throw error;
  }
}

export async function deleteProject(id: string): Promise<void> {
  try {
    const existing = await findProjectById(id);
    if (!existing) {
      throw new Error("Project not found");
    }

    const db = getDatabase();
    await db.delete(ProjectTable).where(eq(ProjectTable.id, id));

    logger.info(`Project deleted: ${id}`);
  } catch (error) {
    logger.error("Failed to delete project", { error, id });
    throw error;
  }
}

export async function archiveProject(id: string): Promise<any> {
  try {
    const existing = await findProjectById(id);
    if (!existing) {
      throw new Error("Project not found");
    }

    const project = new Project(existing);
    project.archive();

    const db = getDatabase();
    const updated = await db
      .update(ProjectTable)
      .set(project.toPlainObject())
      .where(eq(ProjectTable.id, id))
      .returning();

    logger.info(`Project archived: ${id}`);

    return updated[0];
  } catch (error) {
    logger.error("Failed to archive project", { error, id });
    throw error;
  }
}
