import { getDatabase } from "../../../infrastructure/database";
import {
  projects,
  type ProjectSchema,
} from "../../../persistence/schemas/projects.schema";
import { eq } from "drizzle-orm";
import { Project } from "../project.entity";

export function findProjectById(id: string): ProjectSchema | null {
  const db = getDatabase();
  const result = db.select().from(projects).where(eq(projects.id, id)).get();

  if (!result) return null;

  return result;
}

export function findAllProjects(filter?: { status?: string }): ProjectSchema[] {
  const db = getDatabase();

  let query = db.select().from(projects);

  if (filter?.status) {
    query = query.where(eq(projects.status, filter.status));
  }

  return query.all();
}
