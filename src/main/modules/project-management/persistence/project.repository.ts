import { eq, and, desc } from "drizzle-orm";
import { db } from "../../../persistence/db";
import { projects } from "../../../persistence/schemas";
import { ProjectData } from "../entities/project.schema";

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
    let query = db.select().from(projects).orderBy(desc(projects.updatedAt));

    if (filter?.status) {
      query = query.where(eq(projects.status, filter.status));
    }

    if (filter?.limit) {
      query = query.limit(filter.limit);
    }

    if (filter?.offset) {
      query = query.offset(filter.offset);
    }

    const results = await query;

    return results.map((project) => ({
      ...project,
      description: project.description || undefined,
      gitUrl: project.gitUrl || undefined,
      avatar: project.avatar || undefined,
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
      description: result.description || undefined,
      gitUrl: result.gitUrl || undefined,
      avatar: result.avatar || undefined,
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
      description: updated.description || undefined,
      gitUrl: updated.gitUrl || undefined,
      avatar: updated.avatar || undefined,
      createdAt: new Date(updated.createdAt),
      updatedAt: new Date(updated.updatedAt),
    };
  }

  async delete(id: string): Promise<void> {
    await db.delete(projects).where(eq(projects.id, id));
  }
}