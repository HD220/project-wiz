import { z } from "zod";
import { eq, desc } from "drizzle-orm";

import { getDatabase } from "@/infrastructure/database";
import { getLogger } from "@/infrastructure/logger";
import {
  channels,
  ChannelSchema,
} from "@/main/persistence/schemas/channels.schema";
import { Channel, ChannelData } from "../project.entity";

const logger = getLogger("projects");

// Schemas para validação
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

type CreateChannelInput = z.infer<typeof CreateChannelSchema>;
type UpdateChannelInput = z.infer<typeof UpdateChannelSchema>;

// Helper para converter dados do banco para entidade Channel
function dbToChannelData(dbData: ChannelSchema): ChannelData {
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

// Re-export schemas para compatibilidade
export { CreateChannelSchema, UpdateChannelSchema };
export type { CreateChannelInput, UpdateChannelInput };
export { dbToChannelData };
