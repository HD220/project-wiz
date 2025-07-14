import { eq, and, desc } from "drizzle-orm";

import { db } from "../../../persistence/db";
import { projects } from "../../../persistence/schemas";
import { ProjectSchema as ProjectData } from "../../../persistence/schemas/projects.schema";

export interface ProjectFilterOptions {
  status?: "active" | "inactive" | "archived";
  limit?: number;
  offset?: number;
}

export class ProjectRepository {
  async save(data: ProjectData): Promise<ProjectData> {
    const [inserted] = await db
      .insert(projects)
      .values({
        id: data.id,
        name: data.name,
        description: data.description,
        gitUrl: data.gitUrl,
        status: data.status,
        avatar: data.avatar,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      })
      .returning();

    return {
      ...inserted,
      createdAt: new Date(inserted.createdAt),
      updatedAt: new Date(inserted.updatedAt),
    };
  }

  async findMany(filter?: ProjectFilterOptions): Promise<ProjectData[]> {
    const baseQuery = db
      .select()
      .from(projects)
      .orderBy(desc(projects.updatedAt));

    // Apply conditions
    const conditionalQuery = filter?.status
      ? baseQuery.where(eq(projects.status, filter.status))
      : baseQuery;

    // Apply pagination if provided
    const limitQuery =
      filter?.limit !== undefined
        ? conditionalQuery.limit(filter.limit)
        : conditionalQuery;

    const finalQuery =
      filter?.offset !== undefined
        ? limitQuery.offset(filter.offset)
        : limitQuery;

    const results = await finalQuery;

    return results.map((project) => ({
      ...project,
      createdAt: new Date(project.createdAt),
      updatedAt: new Date(project.updatedAt),
    }));
  }

  async findById(id: string): Promise<ProjectData | null> {
    const [result] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, id))
      .limit(1);

    if (!result) {
      return null;
    }

    return {
      ...result,
      createdAt: new Date(result.createdAt),
      updatedAt: new Date(result.updatedAt),
    };
  }

  async update(data: ProjectData): Promise<ProjectData> {
    const [updated] = await db
      .update(projects)
      .set({
        name: data.name,
        description: data.description,
        gitUrl: data.gitUrl,
        status: data.status,
        avatar: data.avatar,
        updatedAt: data.updatedAt,
      })
      .where(eq(projects.id, data.id))
      .returning();

    return {
      ...updated,
      createdAt: new Date(updated.createdAt),
      updatedAt: new Date(updated.updatedAt),
    };
  }

  async delete(id: string): Promise<void> {
    await db.delete(projects).where(eq(projects.id, id));
  }
}
