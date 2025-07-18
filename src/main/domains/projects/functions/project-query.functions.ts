import { eq, desc } from "drizzle-orm";
import { getDatabase } from "@/infrastructure/database";
import { getLogger } from "@/infrastructure/logger";
import {
  projects,
  ProjectSchema,
} from "@/main/persistence/schemas/projects.schema";
import { Project, ProjectData } from "../project.entity";

const logger = getLogger("projects.query");

function dbToProjectData(dbData: ProjectSchema): ProjectData {
  return {
    id: dbData.id,
    name: dbData.name,
    description: dbData.description || "",
    gitUrl: dbData.gitUrl,
    status: dbData.status as "active" | "archived" | "maintenance",
    avatar: dbData.avatar,
    createdAt: dbData.createdAt,
    updatedAt: dbData.updatedAt,
  };
}

export async function findProjectById(id: string): Promise<Project | null> {
  try {
    const db = getDatabase();
    const result = await db
      .select()
      .from(projects)
      .where(eq(projects.id, id))
      .limit(1);

    if (result.length === 0) {
      return null;
    }

    return new Project(dbToProjectData(result[0]));
  } catch (error) {
    logger.error("Failed to find project", { error, id });
    throw error;
  }
}

export async function findAllProjects(): Promise<Project[]> {
  try {
    const db = getDatabase();
    const result = await db
      .select()
      .from(projects)
      .orderBy(desc(projects.updatedAt));

    return result.map((row) => new Project(dbToProjectData(row)));
  } catch (error) {
    logger.error("Failed to find projects", { error });
    throw error;
  }
}

export async function findActiveProjects(): Promise<Project[]> {
  try {
    const db = getDatabase();
    const result = await db
      .select()
      .from(projects)
      .where(eq(projects.status, "active"))
      .orderBy(desc(projects.updatedAt));

    return result.map((row) => new Project(dbToProjectData(row)));
  } catch (error) {
    logger.error("Failed to find active projects", { error });
    throw error;
  }
}
