import { eq, and } from "drizzle-orm";
import { getDatabase } from "../../database/connection";
import { channels } from "./channels.schema";
import { projects } from "../projects.schema";
import { z } from "zod";

// Simple validation schemas
const CreateChannelSchema = z.object({
  projectId: z.string().min(1),
  name: z.string().min(1).max(50),
  description: z.string().optional(),
  type: z.enum(["text"]).default("text"),
  isPrivate: z.boolean().default(false),
  position: z.number().optional(),
});

const UpdateChannelSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  description: z.string().optional(),
  type: z.enum(["text"]).optional(),
  isPrivate: z.boolean().optional(),
  position: z.number().optional(),
});

export type CreateChannelInput = z.infer<typeof CreateChannelSchema>;
export type UpdateChannelInput = z.infer<typeof UpdateChannelSchema>;

// Simple ID generator
function generateChannelId(): string {
  return `ch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Create new channel
 */
export async function createChannel(
  input: CreateChannelInput,
  createdBy: string,
): Promise<any> {
  // 1. Validate input
  const validated = CreateChannelSchema.parse(input);

  // 2. Check if project exists
  const db = getDatabase();
  const project = await db
    .select()
    .from(projects)
    .where(eq(projects.id, validated.projectId))
    .limit(1);

  if (!project.length) {
    throw new Error(`Project ${validated.projectId} not found`);
  }

  // 3. Check if channel name is unique in project
  const existingChannel = await db
    .select()
    .from(channels)
    .where(
      and(
        eq(channels.projectId, validated.projectId),
        eq(channels.name, validated.name),
      ),
    )
    .limit(1);

  if (existingChannel.length > 0) {
    throw new Error(
      `Channel "${validated.name}" already exists in this project`,
    );
  }

  // 4. Determine position
  let position = validated.position ?? 0;
  if (position === 0) {
    const maxPosition = await db
      .select({ max: channels.position })
      .from(channels)
      .where(eq(channels.projectId, validated.projectId))
      .limit(1);
    position = (maxPosition[0]?.max || 0) + 1;
  }

  // 5. Create channel
  const newChannel = {
    id: generateChannelId(),
    projectId: validated.projectId,
    name: validated.name,
    description: validated.description,
    type: validated.type,
    isPrivate: validated.isPrivate,
    position,
    createdBy,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await db.insert(channels).values(newChannel);

  return newChannel;
}

/**
 * Find channel by ID
 */
export async function findChannelById(channelId: string): Promise<any> {
  const db = getDatabase();
  const channel = await db
    .select()
    .from(channels)
    .where(eq(channels.id, channelId))
    .limit(1);

  if (!channel.length) {
    throw new Error(`Channel ${channelId} not found`);
  }

  return channel[0];
}

/**
 * Find channels by project
 */
export async function findChannelsByProject(projectId: string): Promise<any[]> {
  const db = getDatabase();
  return await db
    .select()
    .from(channels)
    .where(eq(channels.projectId, projectId))
    .orderBy(channels.position);
}

/**
 * Update channel
 */
export async function updateChannel(
  channelId: string,
  input: UpdateChannelInput,
): Promise<any> {
  // 1. Validate input
  const validated = UpdateChannelSchema.parse(input);

  // 2. Check if channel exists
  const db = getDatabase();
  const existingChannel = await db
    .select()
    .from(channels)
    .where(eq(channels.id, channelId))
    .limit(1);

  if (!existingChannel.length) {
    throw new Error(`Channel ${channelId} not found`);
  }

  // 3. Check name uniqueness if name is being updated
  if (validated.name) {
    const duplicateChannel = await db
      .select()
      .from(channels)
      .where(
        and(
          eq(channels.projectId, existingChannel[0]!.projectId),
          eq(channels.name, validated.name),
          eq(channels.id, channelId), // Exclude current channel
        ),
      )
      .limit(1);

    if (duplicateChannel.length > 0) {
      throw new Error(
        `Channel "${validated.name}" already exists in this project`,
      );
    }
  }

  // 4. Update channel
  const updatedData = {
    ...validated,
    updatedAt: new Date(),
  };

  await db.update(channels).set(updatedData).where(eq(channels.id, channelId));

  return { ...existingChannel[0], ...updatedData };
}

/**
 * Delete channel
 */
export async function deleteChannel(channelId: string): Promise<void> {
  const db = getDatabase();

  // Check if channel exists
  const existingChannel = await db
    .select()
    .from(channels)
    .where(eq(channels.id, channelId))
    .limit(1);

  if (!existingChannel.length) {
    throw new Error(`Channel ${channelId} not found`);
  }

  // Delete channel (cascade will handle messages)
  await db.delete(channels).where(eq(channels.id, channelId));
}

/**
 * Create default channels for project
 */
export async function createDefaultChannels(
  projectId: string,
  createdBy: string,
): Promise<any[]> {
  const defaultChannels = [
    { name: "general", description: "General project discussion" },
    { name: "development", description: "Development-related discussions" },
    { name: "bugs", description: "Bug reports and fixes" },
  ];

  const createdChannels = [];

  for (let i = 0; i < defaultChannels.length; i++) {
    const channel = await createChannel(
      {
        projectId,
        name: defaultChannels[i]!.name,
        description: defaultChannels[i]!.description,
        type: "text",
        isPrivate: false,
        position: i + 1,
      },
      createdBy,
    );

    createdChannels.push(channel);
  }

  return createdChannels;
}
