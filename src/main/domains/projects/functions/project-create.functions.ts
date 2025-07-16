import { getDatabase } from "../../../infrastructure/database";
import { getLogger } from "../../../infrastructure/logger";
import {
  projects,
  type ProjectSchema,
} from "../../../persistence/schemas/projects.schema";
import { Project } from "../entities";

const logger = getLogger("projects.create");

export async function createProject(data: {
  name: string;
  description?: string | null;
  gitUrl?: string | null;
  createdBy?: string;
}): Promise<ProjectSchema> {
  try {
    const project = new Project({
      name: data.name,
      description: data.description,
      gitUrl: data.gitUrl,
    });

    const db = getDatabase();
    const saved = await db
      .insert(projects)
      .values(project.toPlainObject())
      .returning();

    logger.info(`Project created: ${project.getId()}`);
    return saved[0];
  } catch (error) {
    logger.error("Failed to create project", { error, data });
    throw error;
  }
}
