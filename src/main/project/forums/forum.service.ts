import { eq, and, desc, sql } from "drizzle-orm";
import { getDatabase } from "../../database/connection";
import { forumTopics, forumPosts } from "./forums.schema";
import { generateId } from "../../../shared/utils/id-generator";
import { z } from "zod";

// Simple validation schemas
const CreateTopicSchema = z.object({
  projectId: z.string().min(1),
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  status: z.enum(["open", "closed", "locked"]).default("open"),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  category: z.string().optional(),
  tags: z.string().optional(),
});

const UpdateTopicSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  status: z.enum(["open", "closed", "locked"]).optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
  category: z.string().optional(),
  tags: z.string().optional(),
});

const CreatePostSchema = z.object({
  topicId: z.string().min(1),
  content: z.string().min(1),
  contentType: z.enum(["text", "markdown"]).default("markdown"),
  replyToId: z.string().optional(),
});

const UpdatePostSchema = z.object({
  content: z.string().min(1),
  contentType: z.enum(["text", "markdown"]).default("markdown"),
});

export type CreateTopicInput = z.infer<typeof CreateTopicSchema>;
export type UpdateTopicInput = z.infer<typeof UpdateTopicSchema>;
export type CreatePostInput = z.infer<typeof CreatePostSchema>;
export type UpdatePostInput = z.infer<typeof UpdatePostSchema>;

/**
 * Create new forum topic
 */
export async function createForumTopic(
  input: CreateTopicInput,
  createdBy: string,
  createdByType: "user" | "agent" = "user",
): Promise<any> {
  // 1. Validate input
  const validated = CreateTopicSchema.parse(input);

  // 2. Create topic
  const db = getDatabase();
  const topicId = generateId();
  const now = new Date();

  const newTopic = {
    id: topicId,
    projectId: validated.projectId,
    title: validated.title,
    description: validated.description,
    status: validated.status,
    priority: validated.priority,
    category: validated.category,
    tags: validated.tags,
    createdBy,
    createdByType,
    viewCount: 0,
    postCount: 0,
    lastActivityAt: now,
    createdAt: now,
    updatedAt: now,
  };

  await db.insert(forumTopics).values(newTopic);

  return newTopic;
}

/**
 * Find forum topic by ID
 */
export async function findForumTopicById(topicId: string): Promise<any | null> {
  const db = getDatabase();

  const topic = await db.query.forumTopics.findFirst({
    where: eq(forumTopics.id, topicId),
  });

  if (!topic) return null;

  return {
    ...topic,
    tags: topic.tags ? JSON.parse(topic.tags) : [],
  };
}

/**
 * Find forum topics by project
 */
export async function findForumTopicsByProject(
  projectId: string,
  filters?: {
    status?: string;
    category?: string;
    priority?: string;
  },
): Promise<any[]> {
  const db = getDatabase();

  const whereConditions = [eq(forumTopics.projectId, projectId)];

  if (filters?.status) {
    whereConditions.push(eq(forumTopics.status, filters.status));
  }
  if (filters?.category) {
    whereConditions.push(eq(forumTopics.category, filters.category));
  }
  if (filters?.priority) {
    whereConditions.push(eq(forumTopics.priority, filters.priority));
  }

  const topics = await db.query.forumTopics.findMany({
    where: and(...whereConditions),
    orderBy: [desc(forumTopics.lastActivityAt)],
  });

  return topics.map((topic) => ({
    ...topic,
    tags: topic.tags ? JSON.parse(topic.tags) : [],
  }));
}

/**
 * Update forum topic
 */
export async function updateForumTopic(
  topicId: string,
  input: UpdateTopicInput,
): Promise<any> {
  // 1. Validate input
  const validated = UpdateTopicSchema.parse(input);

  // 2. Update topic
  const db = getDatabase();
  const updateData = {
    ...validated,
    updatedAt: new Date(),
  };

  await db
    .update(forumTopics)
    .set(updateData)
    .where(eq(forumTopics.id, topicId));

  return await findForumTopicById(topicId);
}

/**
 * Delete forum topic
 */
export async function deleteForumTopic(topicId: string): Promise<void> {
  const db = getDatabase();

  await db.delete(forumTopics).where(eq(forumTopics.id, topicId));
}

/**
 * Create forum post
 */
export async function createForumPost(
  input: CreatePostInput,
  authorId: string,
  authorType: "user" | "agent" = "user",
): Promise<any> {
  // 1. Validate input
  const validated = CreatePostSchema.parse(input);

  // 2. Get next position
  const db = getDatabase();
  const maxPosition = await db
    .select({ max: forumPosts.position })
    .from(forumPosts)
    .where(eq(forumPosts.topicId, validated.topicId))
    .limit(1);

  const position = (maxPosition[0]?.max || 0) + 1;

  // 3. Create post
  const postId = generateId();
  const now = new Date();

  const newPost = {
    id: postId,
    topicId: validated.topicId,
    content: validated.content,
    contentType: validated.contentType,
    authorId,
    authorType,
    replyToId: validated.replyToId,
    position,
    metadata: null,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
  };

  await db.insert(forumPosts).values(newPost);

  // 4. Update topic stats
  await db
    .update(forumTopics)
    .set({
      postCount: sql`${forumTopics.postCount} + 1`,
      lastActivityAt: now,
      updatedAt: now,
    })
    .where(eq(forumTopics.id, validated.topicId));

  return newPost;
}

/**
 * Find forum posts by topic
 */
export async function findForumPostsByTopic(
  topicId: string,
  options?: {
    limit?: number;
    offset?: number;
  },
): Promise<any[]> {
  const db = getDatabase();

  const posts = await db.query.forumPosts.findMany({
    where: and(eq(forumPosts.topicId, topicId), eq(forumPosts.deletedAt, null)),
    orderBy: [forumPosts.position],
    limit: options?.limit || 50,
    offset: options?.offset || 0,
  });

  return posts.map((post) => ({
    ...post,
    metadata: post.metadata ? JSON.parse(post.metadata) : {},
  }));
}

/**
 * Update forum post
 */
export async function updateForumPost(
  postId: string,
  input: UpdatePostInput,
): Promise<any> {
  // 1. Validate input
  const validated = UpdatePostSchema.parse(input);

  // 2. Update post
  const db = getDatabase();
  const updateData = {
    ...validated,
    updatedAt: new Date(),
  };

  await db.update(forumPosts).set(updateData).where(eq(forumPosts.id, postId));

  return await db.query.forumPosts.findFirst({
    where: eq(forumPosts.id, postId),
  });
}

/**
 * Delete forum post (soft delete)
 */
export async function deleteForumPost(postId: string): Promise<void> {
  const db = getDatabase();

  await db
    .update(forumPosts)
    .set({
      deletedAt: new Date(),
    })
    .where(eq(forumPosts.id, postId));

  // Update topic post count
  const post = await db.query.forumPosts.findFirst({
    where: eq(forumPosts.id, postId),
  });

  if (post) {
    await db
      .update(forumTopics)
      .set({
        postCount: sql`${forumTopics.postCount} - 1`,
        updatedAt: new Date(),
      })
      .where(eq(forumTopics.id, post.topicId));
  }
}

/**
 * Increment topic view count
 */
export async function incrementTopicViewCount(topicId: string): Promise<void> {
  const db = getDatabase();

  await db
    .update(forumTopics)
    .set({
      viewCount: sql`${forumTopics.viewCount} + 1`,
    })
    .where(eq(forumTopics.id, topicId));
}
