import { eq } from "drizzle-orm";

import { getDatabase } from "@/main/database/connection";
import { CrudService } from "@/main/features/base/crud.service";
import {
  projectsTable,
  type SelectProject,
  type InsertProject,
} from "@/main/features/project/project.model";

export class ProjectService extends CrudService<
  typeof projectsTable,
  SelectProject,
  InsertProject
> {
  protected table = projectsTable;

  /**
   * List all active projects for a user
   */
  static async listByUserId(userId: string): Promise<SelectProject[]> {
    const db = getDatabase();

    return await db
      .select()
      .from(projectsTable)
      .where(eq(projectsTable.ownerId, userId));
  }

  /**
   * Update project status
   */
  static async updateStatus(
    id: string,
    status: "active" | "archived",
  ): Promise<SelectProject> {
    const instance = new ProjectService();
    return await instance.update(id, { status });
  }

  /**
   * Archive a project
   */
  static async archive(id: string): Promise<SelectProject> {
    return await ProjectService.updateStatus(id, "archived");
  }

  // Static wrappers for backward compatibility
  static async create(input: InsertProject): Promise<SelectProject> {
    const instance = new ProjectService();
    return await instance.create(input);
  }

  static async findById(id: string): Promise<SelectProject | null> {
    const instance = new ProjectService();
    return await instance.findById(id);
  }

  static async update(
    id: string,
    input: Partial<InsertProject>,
  ): Promise<SelectProject> {
    const instance = new ProjectService();
    return await instance.update(id, input);
  }

  static async delete(id: string): Promise<void> {
    const instance = new ProjectService();
    return await instance.delete(id);
  }

  static async listAll(): Promise<SelectProject[]> {
    const instance = new ProjectService();
    return await instance.findAll();
  }
}
