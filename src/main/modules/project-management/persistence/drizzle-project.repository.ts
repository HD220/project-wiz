import { eq } from "drizzle-orm";

import { Project } from "@/main/modules/project-management/domain/project.entity";
import { IProjectRepository } from "@/main/modules/project-management/domain/project.repository";
import { db } from "@/main/persistence/db";

import { projects } from "./schema";



export class DrizzleProjectRepository implements IProjectRepository {
  async save(project: Project): Promise<Project> {
    try {
      await db.insert(projects).values({
        id: project.id,
        name: project.name,
        createdAt: project.createdAt,
      }).onConflictDoUpdate({
        target: projects.id,
        set: { name: project.name },
      });
      return project;
    } catch (error: unknown) {
      console.error("Failed to save project:", error);
      throw new Error(`Failed to save project: ${(error as Error).message}`);
    }
  }

  async findById(id: string): Promise<Project | undefined> {
    try {
      const result = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
      if (result.length === 0) {
        return undefined;
      }
      const projectData = result[0];
      return new Project(projectData, projectData.id);
    } catch (error: unknown) {
      console.error(`Failed to find project by ID ${id}:`, error);
      throw new Error(`Failed to find project by ID: ${(error as Error).message}`);
    }
  }

  async findAll(): Promise<Project[]> {
    try {
      const results = await db.select().from(projects);
      return results.map(data => new Project(data, data.id));
    } catch (error: unknown) {
      console.error("Failed to find all projects:", error);
      throw new Error(`Failed to find all projects: ${(error as Error).message}`);
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const result = await db.delete(projects).where(eq(projects.id, id));
      return result.changes > 0;
    } catch (error: unknown) {
      console.error(`Failed to delete project with ID ${id}:`, error);
      throw new Error(`Failed to delete project: ${(error as Error).message}`);
    }
  }
}
