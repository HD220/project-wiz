import { z } from "zod";
import { eq } from "drizzle-orm";
import { getDatabase } from "@/infrastructure/database";
import { getLogger } from "@/infrastructure/logger";
import { projects } from "@/main/persistence/schemas/projects.schema";
import { Project, ProjectData } from "../project.entity";
import { findProjectById } from "./project-query.functions";

const logger = getLogger("projects.update");

const UpdateProjectSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  gitUrl: z.string().url().optional().nullable(),
  avatar: z.string().nullable().optional(),
});

export type UpdateProjectInput = z.infer<typeof UpdateProjectSchema>;

export async function updateProject(
  id: string,
  input: UpdateProjectInput,
): Promise<Project> {
  try {
    const validated = UpdateProjectSchema.parse(input);
    const db = getDatabase();

    const existingProject = await findProjectById(id);
    if (!existingProject) {
      throw new Error(`Project not found: ${id}`);
    }

    const updateData = {
      ...validated,
      updatedAt: new Date(),
    };

    const result = await db
      .update(projects)
      .set(updateData)
      .where(eq(projects.id, id))
      .returning();

    const projectData: ProjectData = {
      id: result[0].id,
      name: result[0].name,
      description: result[0].description || "",
      gitUrl: result[0].gitUrl,
      status: result[0].status as "active" | "archived" | "maintenance",
      avatar: result[0].avatar,
      createdAt: result[0].createdAt,
      updatedAt: result[0].updatedAt,
    };

    const updatedProject = new Project(projectData);

    logger.info(`Project updated: ${updatedProject.getName()}`);
    return updatedProject;
  } catch (error) {
    logger.error("Failed to update project", { error, id, input });
    throw error;
  }
}

export async function archiveProject(id: string): Promise<Project> {
  try {
    const db = getDatabase();

    const existingProject = await findProjectById(id);
    if (!existingProject) {
      throw new Error(`Project not found: ${id}`);
    }

    const result = await db
      .update(projects)
      .set({ status: "archived", updatedAt: new Date() })
      .where(eq(projects.id, id))
      .returning();

    const projectData: ProjectData = {
      id: result[0].id,
      name: result[0].name,
      description: result[0].description || "",
      gitUrl: result[0].gitUrl,
      status: result[0].status as "active" | "archived" | "maintenance",
      avatar: result[0].avatar,
      createdAt: result[0].createdAt,
      updatedAt: result[0].updatedAt,
    };

    const archivedProject = new Project(projectData);

    logger.info(`Project archived: ${archivedProject.getName()}`);
    return archivedProject;
  } catch (error) {
    logger.error("Failed to archive project", { error, id });
    throw error;
  }
}

export async function deleteProject(id: string): Promise<void> {
  try {
    const db = getDatabase();

    const existingProject = await findProjectById(id);
    if (!existingProject) {
      throw new Error(`Project not found: ${id}`);
    }

    await db.delete(projects).where(eq(projects.id, id));

    logger.info(`Project deleted: ${id}`);
  } catch (error) {
    logger.error("Failed to delete project", { error, id });
    throw error;
  }
}
