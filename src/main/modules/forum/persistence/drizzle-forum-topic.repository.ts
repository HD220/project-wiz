import { eq } from "drizzle-orm";
import { ApplicationError } from "@/main/errors/application.error";

import { ForumTopic } from "@/main/modules/forum/domain/forum-topic.entity";
import type { IForumTopicRepository } from "@/main/modules/forum/domain/forum-topic.repository";
import { BaseRepository } from "@/main/persistence/base.repository";
import type { NodeSQLiteDatabase } from 'drizzle-orm/node-sqlite';
import type { InferSelectModel } from 'drizzle-orm/sqlite-core';

import { forumTopics } from "./schema";

export class DrizzleForumTopicRepository extends BaseRepository<ForumTopic, typeof forumTopics> implements IForumTopicRepository {
  constructor(db: NodeSQLiteDatabase<any>) {
    super(db, forumTopics);
  }

  protected mapToDomainEntity(row: InferSelectModel<typeof forumTopics>): ForumTopic {
    return new ForumTopic(
      {
        title: row.title,
        authorId: row.authorId,
        createdAt: new Date(row.createdAt),
        updatedAt: new Date(row.updatedAt),
      },
      row.id,
    );
  }
}
