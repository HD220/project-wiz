import { eq } from "drizzle-orm";

import { db } from "@/main/persistence/db";
import { ForumPost } from "@/main/modules/forum/domain/forum-post.entity";

import { forumPosts } from "./schema";

export interface IForumPostRepository {
  save(post: ForumPost): Promise<ForumPost>;
  findById(id: string): Promise<ForumPost | undefined>;
  findByTopicId(topicId: string): Promise<ForumPost[]>;
  delete(id: string): Promise<boolean>;
}

export class DrizzleForumPostRepository implements IForumPostRepository {
  async save(post: ForumPost): Promise<ForumPost> {
    try {
      await db.insert(forumPosts).values({
        id: post.id,
        topicId: post.topicId,
        authorId: post.authorId,
        content: post.content,
        createdAt: post.createdAt.toISOString(),
        updatedAt: post.updatedAt.toISOString(),
      }).onConflictDoUpdate({
        target: forumPosts.id,
        set: {
          content: post.content,
          updatedAt: post.updatedAt.toISOString(),
        },
      });
      return post;
    } catch (error: unknown) {
      console.error("Failed to save forum post:", error);
      throw new Error(`Failed to save forum post: ${(error as Error).message}`);
    }
  }

  async findById(id: string): Promise<ForumPost | undefined> {
    try {
      const result = await db.select().from(forumPosts).where(eq(forumPosts.id, id)).limit(1);
      if (result.length === 0) {
        return undefined;
      }
      const postData = result[0];
      return new ForumPost({
        topicId: postData.topicId,
        authorId: postData.authorId,
        content: postData.content,
        createdAt: new Date(postData.createdAt),
        updatedAt: new Date(postData.updatedAt),
      }, postData.id);
    } catch (error: unknown) {
      console.error(`Failed to find forum post by ID ${id}:`, error);
      throw new Error(`Failed to find forum post by ID: ${(error as Error).message}`);
    }
  }

  async findByTopicId(topicId: string): Promise<ForumPost[]> {
    try {
      const results = await db.select().from(forumPosts).where(eq(forumPosts.topicId, topicId));
      return results.map(data => new ForumPost({
        topicId: data.topicId,
        authorId: data.authorId,
        content: data.content,
        createdAt: new Date(data.createdAt),
        updatedAt: new Date(data.updatedAt),
      }, data.id));
    } catch (error: unknown) {
      console.error(`Failed to find forum posts by topic ID ${topicId}:`, error);
      throw new Error(`Failed to find forum posts by topic ID: ${(error as Error).message}`);
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const result = await db.delete(forumPosts).where(eq(forumPosts.id, id));
      return result.changes > 0;
    } catch (error: unknown) {
      console.error(`Failed to delete forum post with ID ${id}:`, error);
      throw new Error(`Failed to delete forum post: ${(error as Error).message}`);
    }
  }
}