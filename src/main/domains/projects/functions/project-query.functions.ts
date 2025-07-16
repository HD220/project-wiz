import { getDatabase } from "../../infrastructure";
import { projects } from "../../../persistence/schemas/projects.schema";
import { eq } from "drizzle-orm";
import { Project } from "../entities/project.entity";

export function findProjectById(
  id: string,
): { id: string; name: string } | null {
  const db = getDatabase();
  const result = db.select().from(projects).where(eq(projects.id, id)).get();

  if (!result) return null;

  return {
    id: result.id,
    name: result.name,
  };
}

export function findAllProjects(): { id: string; name: string }[] {
  const db = getDatabase();
  const results = db.select().from(projects).all();

  return results.map((result) => ({
    id: result.id,
    name: result.name,
  }));
}
