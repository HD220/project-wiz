import { z } from "zod";
import { eq } from "drizzle-orm";
import { getDatabase } from "../../../infrastructure/database";
import { getLogger } from "../../../infrastructure/logger";
import { projects } from "../../../persistence/schemas/projects.schema";
import { channels } from "../../../persistence/schemas/channels.schema";
import { Project } from "../project.entity";
import { createProjectFromDbData } from "./project.mapper";

const logger = getLogger("projects");

// Schema para validação
const UpdateProjectSchema = z
  .object({
    name: z.string().min(1).max(100),
    description: z.string().default(""),
    gitUrl: z.string().url().optional().nullable(),
    avatar: z.string().nullable().optional(),
  })
  .partial();

type UpdateProjectInput = z.infer<typeof UpdateProjectSchema>;

export async function updateProject(
  id: string,
  input: UpdateProjectInput,
): Promise<Project> {
  const validated = validateUpdateInput(input);
  const updateData = prepareUpdateData(validated);
  const project = await performProjectUpdate(id, updateData);
  logger.info(`Project updated: ${project.getName()}`);
  return project;
}

function validateUpdateInput(input: UpdateProjectInput) {
  return UpdateProjectSchema.parse(input);
}

function prepareUpdateData(validated: UpdateProjectInput) {
  return {
    ...validated,
    updatedAt: new Date(),
  };
}

async function performProjectUpdate(id: string, updateData: any) {
  const db = getDatabase();
  const result = await db
    .update(projects)
    .set(updateData)
    .where(eq(projects.id, id))
    .returning();

  if (result.length === 0) {
    throw new Error(`Project not found: ${id}`);
  }

  return createProjectFromDbData(result[0]);
}

export async function deleteProject(id: string): Promise<void> {
  const db = getDatabase();
  await deleteProjectChannels(id);
  await deleteProjectRecord(id);
}

async function deleteProjectChannels(projectId: string) {
  const db = getDatabase();
  await db.delete(channels).where(eq(channels.projectId, projectId));
}

async function deleteProjectRecord(id: string) {
  const db = getDatabase();
  const result = await db
    .delete(projects)
    .where(eq(projects.id, id))
    .returning({ name: projects.name });

  if (result.length === 0) {
    throw new Error(`Project not found: ${id}`);
  }

  logger.info(`Project deleted: ${result[0].name}`);
}

export type { UpdateProjectInput };
