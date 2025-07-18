import { eq, and, ne } from "drizzle-orm";
import { getDatabase } from "../../database/connection";
import { projects } from "./projects.schema";
import { channels } from "../channels/channels.schema";
import { generateId } from "../../../shared/utils/id-generator";
import { z } from "zod";

// Simple validation schemas
const CreateProjectSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  gitUrl: z.string().url().optional(),
  iconEmoji: z.string().optional(),
});

const UpdateProjectSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  gitUrl: z.string().url().optional(),
  iconEmoji: z.string().optional(),
});

export type CreateProjectInput = z.infer<typeof CreateProjectSchema>;
export type UpdateProjectInput = z.infer<typeof UpdateProjectSchema>;

/**
 * Create new project
 * KISS approach: Simple function that does one thing well
 */
export async function createProject(
  input: CreateProjectInput,
  ownerId: string,
): Promise<any> {
  // 1. Validate input
  const validated = CreateProjectSchema.parse(input);

  // 2. Check business rules
  await validateProjectLimits(ownerId);
  await validateUniqueName(validated.name, ownerId);

  // 3. Create project
  const db = getDatabase();
  const projectId = generateId();
  const now = new Date();

  const newProject = {
    id: projectId,
    name: validated.name,
    description: validated.description,
    gitUrl: validated.gitUrl,
    iconEmoji: validated.iconEmoji,
    visibility: "private" as const,
    status: "active" as const,
    settings: JSON.stringify({}),
    ownerId,
    createdAt: now,
    updatedAt: now,
  };

  await db.insert(projects).values(newProject);

  // 4. Create default channels
  await createDefaultChannels(projectId, ownerId);

  // 5. TODO: Initialize Git if needed

  return newProject;
}

/**
 * Find project by ID
 */
export async function findProjectById(projectId: string): Promise<any | null> {
  const db = getDatabase();

  const project = await db.query.projects.findFirst({
    where: eq(projects.id, projectId),
  });

  if (!project) return null;

  return {
    ...project,
    settings: project.settings ? JSON.parse(project.settings) : {},
  };
}

/**
 * Find projects by user
 */
export async function findProjectsByUser(userId: string): Promise<any[]> {
  const db = getDatabase();

  const userProjects = await db.query.projects.findMany({
    where: and(eq(projects.ownerId, userId), eq(projects.status, "active")),
    orderBy: [projects.updatedAt],
  });

  return userProjects.map((project) => ({
    ...project,
    settings: project.settings ? JSON.parse(project.settings) : {},
  }));
}

/**
 * Update project
 */
export async function updateProject(
  projectId: string,
  input: UpdateProjectInput,
  userId: string,
): Promise<any> {
  // 1. Validate input
  const validated = UpdateProjectSchema.parse(input);

  // 2. Check permissions
  await validateProjectPermissions(projectId, userId);

  // 3. Check unique name if changed
  if (validated.name) {
    await validateUniqueName(validated.name, userId, projectId);
  }

  // 4. Update project
  const db = getDatabase();
  const updateData = {
    ...validated,
    updatedAt: new Date(),
  };

  await db.update(projects).set(updateData).where(eq(projects.id, projectId));

  // 5. Return updated project
  return await findProjectById(projectId);
}

/**
 * Archive project
 */
export async function archiveProject(
  projectId: string,
  userId: string,
): Promise<void> {
  const db = getDatabase();

  // Check permissions (only owner can archive)
  await validateProjectPermissions(projectId, userId);

  await db
    .update(projects)
    .set({
      status: "archived",
      updatedAt: new Date(),
    })
    .where(eq(projects.id, projectId));
}

/**
 * Delete project (soft delete)
 */
export async function deleteProject(
  projectId: string,
  userId: string,
): Promise<void> {
  const db = getDatabase();

  // Check permissions (only owner can delete)
  await validateProjectPermissions(projectId, userId);

  await db
    .update(projects)
    .set({
      status: "deleted",
      updatedAt: new Date(),
    })
    .where(eq(projects.id, projectId));
}

// Helper functions (kept simple and focused)

async function validateProjectLimits(userId: string): Promise<void> {
  const userProjects = await findProjectsByUser(userId);
  const MAX_PROJECTS_PER_USER = 50;

  if (userProjects.length >= MAX_PROJECTS_PER_USER) {
    throw new Error(`Maximum of ${MAX_PROJECTS_PER_USER} projects per user`);
  }
}

async function validateUniqueName(
  name: string,
  userId: string,
  excludeProjectId?: string,
): Promise<void> {
  const db = getDatabase();

  const whereConditions = [
    eq(projects.ownerId, userId),
    eq(projects.name, name),
  ];

  if (excludeProjectId) {
    whereConditions.push(ne(projects.id, excludeProjectId));
  }

  const existing = await db.query.projects.findFirst({
    where: and(...whereConditions),
  });

  if (existing) {
    throw new Error("Project name already exists");
  }
}

async function validateProjectPermissions(
  projectId: string,
  userId: string,
): Promise<void> {
  const project = await findProjectById(projectId);

  if (!project) {
    throw new Error("Project not found");
  }

  // For now, only owner can modify
  if (project.ownerId !== userId) {
    throw new Error("Only project owner can perform this action");
  }
}

async function createDefaultChannels(
  projectId: string,
  createdBy: string,
): Promise<void> {
  const db = getDatabase();
  const now = new Date();

  const defaultChannels = [
    { name: "general", description: "General discussion", position: 0 },
    { name: "development", description: "Development discussion", position: 1 },
    { name: "random", description: "Random conversations", position: 2 },
  ];

  const channelValues = defaultChannels.map((channel) => ({
    id: generateId(),
    projectId,
    name: channel.name,
    description: channel.description,
    type: "text" as const,
    position: channel.position,
    isPrivate: false,
    createdBy,
    createdAt: now,
    updatedAt: now,
  }));

  await db.insert(channels).values(channelValues);
}
