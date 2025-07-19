import { eq } from "drizzle-orm";

import { getDatabase } from "@/main/database/connection";
import {
  projectsTable,
  type SelectProject,
  type InsertProject,
  type UpdateProject,
} from "@/main/project/projects.schema";

export class ProjectService {
  /**
   * Create a new project
   */
  static async create(input: InsertProject): Promise<SelectProject> {
    const db = getDatabase();

    const [newProject] = await db
      .insert(projectsTable)
      .values(input)
      .returning();

    if (!newProject) {
      throw new Error("Failed to create project");
    }

    return newProject;
  }

  /**
   * Find project by ID
   */
  static async findById(id: string): Promise<SelectProject | null> {
    const db = getDatabase();

    const [project] = await db
      .select()
      .from(projectsTable)
      .where(eq(projectsTable.id, id))
      .limit(1);

    return project || null;
  }

  /**
   * List all active projects
   */
  static async listAll(): Promise<SelectProject[]> {
    const db = getDatabase();

    return await db
      .select()
      .from(projectsTable)
      .where(eq(projectsTable.status, "active"));
  }

  /**
   * Update project
   */
  static async update(input: UpdateProject): Promise<SelectProject> {
    const db = getDatabase();

    const existingProject = await this.findById(input.id);
    if (!existingProject) {
      throw new Error("Project not found");
    }

    const [updatedProject] = await db
      .update(projectsTable)
      .set(input)
      .where(eq(projectsTable.id, input.id))
      .returning();

    if (!updatedProject) {
      throw new Error("Failed to update project");
    }

    return updatedProject;
  }

  /**
   * Archive project
   */
  static async archive(id: string): Promise<SelectProject> {
    const db = getDatabase();

    const existingProject = await this.findById(id);
    if (!existingProject) {
      throw new Error("Project not found");
    }

    const [archivedProject] = await db
      .update(projectsTable)
      .set({ status: "archived" })
      .where(eq(projectsTable.id, id))
      .returning();

    if (!archivedProject) {
      throw new Error("Failed to archive project");
    }

    return archivedProject;
  }
}
