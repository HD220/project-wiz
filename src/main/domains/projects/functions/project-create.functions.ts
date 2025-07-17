import { z } from "zod";
import { getDatabase } from "../../../infrastructure/database";
import { getLogger } from "../../../infrastructure/logger";
import { projects } from "../../../persistence/schemas/projects.schema";
import { channels } from "../../../persistence/schemas/channels.schema";
import { Project } from "../project.entity";
import { createProjectFromDbData } from "./project.mapper";

const logger = getLogger("projects");

// Schema para validação
const CreateProjectSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().default(""),
  gitUrl: z.string().url().optional().nullable(),
  avatar: z.string().nullable().optional(),
});

type CreateProjectInput = z.infer<typeof CreateProjectSchema>;

export async function createProject(
  input: CreateProjectInput,
): Promise<Project> {
  const validated = validateProjectInput(input);
  const projectData = prepareProjectData(validated);
  const project = await insertProjectToDatabase(projectData);
  await createGeneralChannel(project);
  logger.info(`Project created: ${project.getName()}`);
  return project;
}

function validateProjectInput(input: CreateProjectInput) {
  return CreateProjectSchema.parse(input);
}

function prepareProjectData(validated: CreateProjectInput) {
  const now = new Date();
  return {
    ...validated,
    gitUrl: validated.gitUrl || null,
    avatar: validated.avatar || null,
    status: "active" as const,
    createdAt: now,
    updatedAt: now,
  };
}

async function insertProjectToDatabase(projectData: any) {
  const db = getDatabase();
  const result = await db.insert(projects).values(projectData).returning();
  return createProjectFromDbData(result[0]);
}

async function createGeneralChannel(project: Project) {
  const db = getDatabase();
  const now = new Date();
  const channelData = {
    name: "general",
    description: "Canal geral do projeto",
    projectId: project.getId(),
    isGeneral: true,
    createdAt: now,
    updatedAt: now,
  };
  await db.insert(channels).values(channelData);
}

export type { CreateProjectInput };
