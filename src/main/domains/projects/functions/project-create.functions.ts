import { z } from "zod";
import { getDatabase } from "@/infrastructure/database";
import { getLogger } from "@/infrastructure/logger";
import { projects } from "@/main/persistence/schemas/projects.schema";
import { channels } from "@/main/persistence/schemas/channels.schema";
import { Project, ProjectData } from "../project.entity";

const logger = getLogger("projects.create");

const CreateProjectSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().default(""),
  gitUrl: z.string().url().optional().nullable(),
  avatar: z.string().nullable().optional(),
});

export type CreateProjectInput = z.infer<typeof CreateProjectSchema>;

export async function createProject(
  input: CreateProjectInput,
): Promise<Project> {
  try {
    const validated = CreateProjectSchema.parse(input);
    const db = getDatabase();

    const now = new Date();
    const dbData = {
      ...validated,
      gitUrl: validated.gitUrl || null,
      avatar: validated.avatar || null,
      status: "active" as const,
      createdAt: now,
      updatedAt: now,
    };

    const result = await db.insert(projects).values(dbData).returning();

    const projectData: ProjectData = {
      id: result[0].id,
      name: result[0].name,
      description: result[0].description || "",
      gitUrl: result[0].gitUrl,
      status: result[0].status as "active" | "archived" | "maintenance",
      avatar: result[0].avatar,
      createdAt: result[0].createdAt,
      updatedAt: result[0].updatedAt,
    };

    const project = new Project(projectData);

    // Criar canal geral automaticamente
    const channelData = {
      name: "general",
      description: "Canal geral do projeto",
      projectId: project.getId(),
      isGeneral: true,
      createdAt: now,
      updatedAt: now,
    };

    await db.insert(channels).values(channelData);

    logger.info(`Project created: ${project.getName()}`);
    return project;
  } catch (error) {
    logger.error("Failed to create project", { error, input });
    throw error;
  }
}
