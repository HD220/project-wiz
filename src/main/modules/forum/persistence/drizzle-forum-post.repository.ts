import { eq } from "drizzle-orm";
import { ApplicationError } from "@/main/errors/application.error";

import { ForumPost } from "@/main/modules/forum/domain/forum-post.entity";
import type { IForumPostRepository } from "@/main/modules/forum/domain/forum-post.repository";
import { BaseRepository } from "@/main/persistence/base.repository";
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import type { InferSelectModel } from 'drizzle-orm';

import { forumPosts } from "./schema";

export class DrizzleForumPostRepository extends BaseRepository<ForumPost, typeof forumPosts> implements IForumPostRepository {
  constructor(db: BetterSQLite3Database<any>) {
    super(db, forumPosts);
  }

  protected mapToDomainEntity(row: InferSelectModel<typeof forumPosts>): ForumPost {
    return new ForumPost(
      {
        topicId: row.topicId,
        authorId: row.authorId,
        content: row.content,
        createdAt: new Date(row.createdAt),
        updatedAt: new Date(row.updatedAt),
      },
      row.id,
    );
  }

  async findByTopicId(topicId: string): Promise<ForumPost[]> {
    try {
      const results = await this.db
        .select()
        .from(forumPosts)
        .where(eq(forumPosts.topicId, topicId));
      return results.map((data) => this.mapToDomainEntity(data));
    } catch (error: unknown) {
      console.error(
        `Failed to find forum posts by topic ID ${topicId}:`,
        error,
      );
      throw new ApplicationError(
        `Failed to find forum posts by topic ID: ${(error as Error).message}`,
      );
    }
  }
}
