import { z } from "zod";
import { eq, desc } from "drizzle-orm";

import { getDatabase } from "../../infrastructure/database";
import { getLogger } from "../../infrastructure/logger";
import { projects } from "../../persistence/schemas/projects.schema";
import { channels } from "../../persistence/schemas/channels.schema";
import { Project, Channel, ProjectData, ChannelData } from "./project.entity";

const logger = getLogger("projects");

// Schemas para validação
const CreateProjectSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().default(""),
  gitUrl: z.string().url().optional().nullable(),
  avatar: z.string().nullable().optional(),
});

const UpdateProjectSchema = CreateProjectSchema.partial();

const CreateChannelSchema = z.object({
  name: z.string().min(1).max(50),
  description: z.string().default(""),
  projectId: z.string().uuid(),
  isGeneral: z.boolean().default(false),
});

const UpdateChannelSchema = CreateChannelSchema.partial().omit([
  "projectId",
  "isGeneral",
]);

type CreateProjectInput = z.infer<typeof CreateProjectSchema>;
type UpdateProjectInput = z.infer<typeof UpdateProjectSchema>;
type CreateChannelInput = z.infer<typeof CreateChannelSchema>;
type UpdateChannelInput = z.infer<typeof UpdateChannelSchema>;

// Helper para converter dados do banco para entidade Project
function dbToProjectData(dbData: any): ProjectData {
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

// Helper para converter dados do banco para entidade Channel
function dbToChannelData(dbData: any): ChannelData {
  return {
    id: dbData.id,
    name: dbData.name,
    description: dbData.description || "",
    projectId: dbData.projectId,
    isGeneral: dbData.isGeneral || false,
    createdAt: dbData.createdAt,
    updatedAt: dbData.updatedAt,
  };
}

// PROJECT CRUD OPERATIONS
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

    const project = new Project(dbToProjectData(result[0]));

    // Criar canal geral automaticamente
    await createChannel({
      name: "general",
      description: "Canal geral do projeto",
      projectId: project.getId(),
      isGeneral: true,
    });

    logger.info(`Project created: ${project.getName()}`);
    return project;
  } catch (error) {
    logger.error("Failed to create project", { error, input });
    throw error;
  }
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

    return new Project(result[0] as ProjectData);
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

    return result.map((data) => new Project(data as ProjectData));
  } catch (error) {
    logger.error("Failed to find projects", { error });
    throw error;
  }
}

export async function updateProject(
  id: string,
  input: UpdateProjectInput,
): Promise<Project> {
  try {
    const validated = UpdateProjectSchema.parse(input);
    const db = getDatabase();

    const updateData = {
      ...validated,
      updatedAt: new Date(),
    };

    const result = await db
      .update(projects)
      .set(updateData)
      .where(eq(projects.id, id))
      .returning();

    if (result.length === 0) {
      throw new Error(`Project not found: ${id}`);
    }

    const project = new Project(result[0] as ProjectData);
    logger.info(`Project updated: ${project.getName()}`);
    return project;
  } catch (error) {
    logger.error("Failed to update project", { error, id, input });
    throw error;
  }
}

export async function deleteProject(id: string): Promise<void> {
  try {
    const db = getDatabase();

    // Deletar canais primeiro (cascade)
    await db.delete(channels).where(eq(channels.projectId, id));

    const result = await db
      .delete(projects)
      .where(eq(projects.id, id))
      .returning({ name: projects.name });

    if (result.length === 0) {
      throw new Error(`Project not found: ${id}`);
    }

    logger.info(`Project deleted: ${result[0].name}`);
  } catch (error) {
    logger.error("Failed to delete project", { error, id });
    throw error;
  }
}

export async function archiveProject(id: string): Promise<Project> {
  try {
    const project = await findProjectById(id);
    if (!project) {
      throw new Error(`Project not found: ${id}`);
    }

    const archivedProject = project.archive();
    return await updateProjectData(archivedProject);
  } catch (error) {
    logger.error("Failed to archive project", { error, id });
    throw error;
  }
}

// CHANNEL CRUD OPERATIONS
export async function createChannel(
  input: CreateChannelInput,
): Promise<Channel> {
  try {
    const validated = CreateChannelSchema.parse(input);
    const db = getDatabase();

    const now = new Date();
    const channelData: Omit<ChannelData, "id"> = {
      ...validated,
      createdAt: now,
      updatedAt: now,
    };

    const result = await db.insert(channels).values(channelData).returning();

    const channel = new Channel({
      id: result[0].id,
      ...channelData,
    });

    logger.info(
      `Channel created: ${channel.getName()} in project ${channel.getProjectId()}`,
    );
    return channel;
  } catch (error) {
    logger.error("Failed to create channel", { error, input });
    throw error;
  }
}

export async function findChannelById(id: string): Promise<Channel | null> {
  try {
    const db = getDatabase();
    const result = await db
      .select()
      .from(channels)
      .where(eq(channels.id, id))
      .limit(1);

    if (result.length === 0) {
      return null;
    }

    return new Channel(result[0] as ChannelData);
  } catch (error) {
    logger.error("Failed to find channel", { error, id });
    throw error;
  }
}

export async function findChannelsByProjectId(
  projectId: string,
): Promise<Channel[]> {
  try {
    const db = getDatabase();
    const result = await db
      .select()
      .from(channels)
      .where(eq(channels.projectId, projectId))
      .orderBy(desc(channels.createdAt));

    return result.map((data) => new Channel(data as ChannelData));
  } catch (error) {
    logger.error("Failed to find channels", { error, projectId });
    throw error;
  }
}

export async function updateChannel(
  id: string,
  input: UpdateChannelInput,
): Promise<Channel> {
  try {
    const validated = UpdateChannelSchema.parse(input);
    const db = getDatabase();

    const updateData = {
      ...validated,
      updatedAt: new Date(),
    };

    const result = await db
      .update(channels)
      .set(updateData)
      .where(eq(channels.id, id))
      .returning();

    if (result.length === 0) {
      throw new Error(`Channel not found: ${id}`);
    }

    const channel = new Channel(result[0] as ChannelData);
    logger.info(`Channel updated: ${channel.getName()}`);
    return channel;
  } catch (error) {
    logger.error("Failed to update channel", { error, id, input });
    throw error;
  }
}

export async function deleteChannel(id: string): Promise<void> {
  try {
    const channel = await findChannelById(id);
    if (!channel) {
      throw new Error(`Channel not found: ${id}`);
    }

    if (!channel.canDelete()) {
      throw new Error("Cannot delete general channel");
    }

    const db = getDatabase();
    await db.delete(channels).where(eq(channels.id, id));

    logger.info(`Channel deleted: ${channel.getName()}`);
  } catch (error) {
    logger.error("Failed to delete channel", { error, id });
    throw error;
  }
}

// Helpers para atualizar usando dados da entidade
async function updateProjectData(project: Project): Promise<Project> {
  const db = getDatabase();
  const data = project.toData();

  const result = await db
    .update(projects)
    .set(data)
    .where(eq(projects.id, data.id))
    .returning();

  return new Project(result[0] as ProjectData);
}
