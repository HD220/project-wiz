import { eq, and, desc, sql, isNull, inArray } from "drizzle-orm";

import { getDatabase } from "@/main/database/connection";
import { messagesTable } from "@/main/features/message/message.model";

import { projectChannelsTable } from "./project-channel.model";
import { projectsTable } from "./project.model";

import type {
  CreateProjectChannelInput,
  ProjectChannelWithLastMessage,
  ProjectChannelFilters,
  SelectProjectChannel,
} from "./project-channel.types";

export const projectChannelService = {
  async createChannel(
    input: CreateProjectChannelInput,
  ): Promise<SelectProjectChannel> {
    const db = getDatabase();

    return db.transaction((tx) => {
      // Verify project exists and is active
      const projectResults = tx
        .select()
        .from(projectsTable)
        .where(
          and(
            eq(projectsTable.id, input.projectId),
            eq(projectsTable.isActive, true),
          ),
        )
        .limit(1)
        .all();

      const [project] = projectResults;
      if (!project) {
        throw new Error("Project not found or inactive");
      }

      const channelResults = tx
        .insert(projectChannelsTable)
        .values({
          projectId: input.projectId,
          name: input.name,
          description: input.description,
        })
        .returning()
        .all();

      const [channel] = channelResults;
      if (!channel) {
        throw new Error("Failed to create project channel");
      }

      return channel;
    });
  },

  async getProjectChannels(
    projectId: string,
    filters: ProjectChannelFilters = {},
  ): Promise<ProjectChannelWithLastMessage[]> {
    const { includeInactive = false, includeArchived = false } = filters;
    const db = getDatabase();

    const channelConditions = [eq(projectChannelsTable.projectId, projectId)];

    if (!includeInactive) {
      channelConditions.push(eq(projectChannelsTable.isActive, true));
    }

    if (!includeArchived) {
      channelConditions.push(isNull(projectChannelsTable.archivedAt));
    }

    const channels = await db
      .select()
      .from(projectChannelsTable)
      .where(and(...channelConditions))
      .orderBy(desc(projectChannelsTable.createdAt));

    if (channels.length === 0) {
      return [];
    }

    const channelIds = channels.map((channel) => channel.id);

    const messageConditions = [
      inArray(messagesTable.sourceId, channelIds),
      eq(messagesTable.sourceType, "channel" as const),
    ];

    if (!includeInactive) {
      messageConditions.push(eq(messagesTable.isActive, true));
    }

    const latestMessages = await db
      .select({
        id: messagesTable.id,
        sourceId: messagesTable.sourceId,
        content: messagesTable.content,
        authorId: messagesTable.authorId,
        createdAt: messagesTable.createdAt,
        updatedAt: messagesTable.updatedAt,
        rn: sql<number>`ROW_NUMBER() OVER (PARTITION BY ${messagesTable.sourceId} ORDER BY ${messagesTable.createdAt} DESC)`.as(
          "rn",
        ),
      })
      .from(messagesTable)
      .where(and(...messageConditions));

    const latestMessagesMap = new Map();
    for (const message of latestMessages) {
      if (message.rn === 1) {
        latestMessagesMap.set(message.sourceId, {
          id: message.id,
          content: message.content,
          authorId: message.authorId,
          createdAt: message.createdAt,
          updatedAt: message.updatedAt,
        });
      }
    }

    const result: ProjectChannelWithLastMessage[] = [];

    for (const channel of channels) {
      const lastMessage = latestMessagesMap.get(channel.id);

      result.push({
        ...channel,
        lastMessage: lastMessage || undefined,
      });
    }

    return result.sort((channelA, channelB) => {
      const aTime = channelA.lastMessage?.createdAt || channelA.updatedAt;
      const bTime = channelB.lastMessage?.createdAt || channelB.updatedAt;
      return new Date(bTime).getTime() - new Date(aTime).getTime();
    });
  },

  async findById(
    id: string,
    includeInactive = false,
  ): Promise<SelectProjectChannel | null> {
    const db = getDatabase();

    const channelConditions = [eq(projectChannelsTable.id, id)];

    if (!includeInactive) {
      channelConditions.push(eq(projectChannelsTable.isActive, true));
    }

    const [channel] = await db
      .select()
      .from(projectChannelsTable)
      .where(and(...channelConditions))
      .limit(1);

    return channel || null;
  },

  async updateChannel(
    id: string,
    updates: { name?: string; description?: string },
  ): Promise<SelectProjectChannel> {
    const db = getDatabase();

    const [updated] = await db
      .update(projectChannelsTable)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(projectChannelsTable.id, id),
          eq(projectChannelsTable.isActive, true),
        ),
      )
      .returning();

    if (!updated) {
      throw new Error("Channel not found, inactive, or update failed");
    }

    return updated;
  },

  async archiveChannel(channelId: string, archivedBy: string): Promise<void> {
    const db = getDatabase();

    const [channel] = await db
      .select()
      .from(projectChannelsTable)
      .where(
        and(
          eq(projectChannelsTable.id, channelId),
          eq(projectChannelsTable.isActive, true),
          isNull(projectChannelsTable.archivedAt),
        ),
      )
      .limit(1);

    if (!channel) {
      throw new Error("Channel not found, inactive, or already archived");
    }

    const [updated] = await db
      .update(projectChannelsTable)
      .set({
        archivedAt: new Date(),
        archivedBy,
        updatedAt: new Date(),
      })
      .where(eq(projectChannelsTable.id, channelId))
      .returning();

    if (!updated) {
      throw new Error("Failed to archive channel");
    }
  },

  async unarchiveChannel(channelId: string): Promise<void> {
    const db = getDatabase();

    const [channel] = await db
      .select()
      .from(projectChannelsTable)
      .where(
        and(
          eq(projectChannelsTable.id, channelId),
          eq(projectChannelsTable.isActive, true),
        ),
      )
      .limit(1);

    if (!channel) {
      throw new Error("Channel not found or inactive");
    }

    if (!channel.archivedAt) {
      throw new Error("Channel is not archived");
    }

    const [updated] = await db
      .update(projectChannelsTable)
      .set({
        archivedAt: null,
        archivedBy: null,
        updatedAt: new Date(),
      })
      .where(eq(projectChannelsTable.id, channelId))
      .returning();

    if (!updated) {
      throw new Error("Failed to unarchive channel");
    }
  },

  async deleteChannel(id: string, deletedBy: string): Promise<void> {
    const db = getDatabase();

    await db.transaction((tx) => {
      const channelResults = tx
        .select()
        .from(projectChannelsTable)
        .where(
          and(
            eq(projectChannelsTable.id, id),
            eq(projectChannelsTable.isActive, true),
          ),
        )
        .limit(1)
        .all();

      const [channel] = channelResults;
      if (!channel) {
        throw new Error("Channel not found or already inactive");
      }

      tx.update(projectChannelsTable)
        .set({
          isActive: false,
          deactivatedAt: new Date(),
          deactivatedBy: deletedBy,
          updatedAt: new Date(),
        })
        .where(eq(projectChannelsTable.id, id))
        .run();

      tx.update(messagesTable)
        .set({
          isActive: false,
          deactivatedAt: new Date(),
          deactivatedBy: deletedBy,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(messagesTable.sourceId, id),
            eq(messagesTable.sourceType, "channel"),
            eq(messagesTable.isActive, true),
          ),
        )
        .run();
    });
  },

  async restoreChannel(id: string): Promise<SelectProjectChannel> {
    const db = getDatabase();

    const [restored] = await db
      .update(projectChannelsTable)
      .set({
        isActive: true,
        deactivatedAt: null,
        deactivatedBy: null,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(projectChannelsTable.id, id),
          eq(projectChannelsTable.isActive, false),
        ),
      )
      .returning();

    if (!restored) {
      throw new Error("Channel not found or not in soft deleted state");
    }

    return restored;
  },
};
