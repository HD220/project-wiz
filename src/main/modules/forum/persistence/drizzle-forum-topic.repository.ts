import { eq } from "drizzle-orm";

import { db } from "@/main/persistence/db";
import { ForumTopic } from "@/main/modules/forum/domain/forum-topic.entity";

import { forumTopics } from "./schema";

export interface IForumTopicRepository {
  save(topic: ForumTopic): Promise<ForumTopic>;
  findById(id: string): Promise<ForumTopic | undefined>;
  findAll(): Promise<ForumTopic[]>;
  delete(id: string): Promise<boolean>;
}

export class DrizzleForumTopicRepository implements IForumTopicRepository {
  async save(topic: ForumTopic): Promise<ForumTopic> {
    try {
      await db
        .insert(forumTopics)
        .values({
          id: topic.id,
          title: topic.title,
          authorId: topic.authorId,
          createdAt: topic.createdAt.toISOString(),
          updatedAt: topic.updatedAt.toISOString(),
        })
        .onConflictDoUpdate({
          target: forumTopics.id,
          set: {
            title: topic.title,
            updatedAt: topic.updatedAt.toISOString(),
          },
        });
      return topic;
    } catch (error: unknown) {
      console.error("Failed to save forum topic:", error);
      throw new Error(
        `Failed to save forum topic: ${(error as Error).message}`,
      );
    }
  }

  async findById(id: string): Promise<ForumTopic | undefined> {
    try {
      const result = await db
        .select()
        .from(forumTopics)
        .where(eq(forumTopics.id, id))
        .limit(1);
      if (result.length === 0) {
        return undefined;
      }
      const topicData = result[0];
      return new ForumTopic(
        {
          title: topicData.title,
          authorId: topicData.authorId,
          createdAt: new Date(topicData.createdAt),
          updatedAt: new Date(topicData.updatedAt),
        },
        topicData.id,
      );
    } catch (error: unknown) {
      console.error(`Failed to find forum topic by ID ${id}:`, error);
      throw new Error(
        `Failed to find forum topic by ID: ${(error as Error).message}`,
      );
    }
  }

  async findAll(): Promise<ForumTopic[]> {
    try {
      const results = await db.select().from(forumTopics);
      return results.map(
        (data) =>
          new ForumTopic(
            {
              title: data.title,
              authorId: data.authorId,
              createdAt: new Date(data.createdAt),
              updatedAt: new Date(data.updatedAt),
            },
            data.id,
          ),
      );
    } catch (error: unknown) {
      console.error("Failed to find all forum topics:", error);
      throw new Error(
        `Failed to find all forum topics: ${(error as Error).message}`,
      );
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const result = await db.delete(forumTopics).where(eq(forumTopics.id, id));
      return result.changes > 0;
    } catch (error: unknown) {
      console.error(`Failed to delete forum topic with ID ${id}:`, error);
      throw new Error(
        `Failed to delete forum topic: ${(error as Error).message}`,
      );
    }
  }
}
