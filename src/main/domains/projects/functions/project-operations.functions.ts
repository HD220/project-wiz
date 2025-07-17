import { eq } from "drizzle-orm";
import { getDatabase } from "../../../infrastructure/database";
import { getLogger } from "../../../infrastructure/logger";
import { projects } from "../../../persistence/schemas/projects.schema";
import { Project } from "../project.entity";
import { findProjectById } from "./project-query.functions";
import { createProjectFromDbData } from "./project.mapper";

const logger = getLogger("projects");

export async function archiveProject(id: string): Promise<Project> {
  const project = await findProjectOrThrow(id);
  const archivedProject = project.archive();
  return await updateProjectData(archivedProject);
}

export async function activateProject(id: string): Promise<Project> {
  const project = await findProjectOrThrow(id);
  const activatedProject = project.activate();
  return await updateProjectData(activatedProject);
}

async function findProjectOrThrow(id: string): Promise<Project> {
  const project = await findProjectById(id);
  if (!project) {
    throw new Error(`Project not found: ${id}`);
  }
  return project;
}

async function updateProjectData(project: Project): Promise<Project> {
  const db = getDatabase();
  const data = project.toData();
  const result = await db
    .update(projects)
    .set(data)
    .where(eq(projects.id, data.id))
    .returning();

  if (!result[0]) {
    throw new Error("Failed to update project - no result returned");
  }

  return createProjectFromDbData(result[0]);
}
