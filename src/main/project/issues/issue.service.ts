import { eq, and, desc } from "drizzle-orm";
import { getDatabase } from "../../database/connection";
import { issues, issueComments, issueActivities } from "./issues.schema";
import { generateId } from "../../../shared/utils/id-generator";
import { z } from "zod";

// Simple validation schemas
const CreateIssueSchema = z.object({
  projectId: z.string().min(1),
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  status: z.enum(["todo", "in_progress", "done", "cancelled"]).default("todo"),
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
  type: z.enum(["task", "bug", "feature", "improvement"]).default("task"),
  assigneeId: z.string().optional(),
  assigneeType: z.enum(["user", "agent"]).optional(),
  estimatedHours: z.number().optional(),
  storyPoints: z.number().int().min(1).max(100).optional(),
  labels: z.string().optional(),
  dueDate: z.date().optional(),
});

const UpdateIssueSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  status: z.enum(["todo", "in_progress", "done", "cancelled"]).optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
  type: z.enum(["task", "bug", "feature", "improvement"]).optional(),
  assigneeId: z.string().optional(),
  assigneeType: z.enum(["user", "agent"]).optional(),
  estimatedHours: z.number().optional(),
  actualHours: z.number().optional(),
  storyPoints: z.number().int().min(1).max(100).optional(),
  labels: z.string().optional(),
  dueDate: z.date().optional(),
});

const CreateCommentSchema = z.object({
  issueId: z.string().min(1),
  content: z.string().min(1),
  contentType: z.enum(["text", "markdown"]).default("markdown"),
});

export type CreateIssueInput = z.infer<typeof CreateIssueSchema>;
export type UpdateIssueInput = z.infer<typeof UpdateIssueSchema>;
export type CreateCommentInput = z.infer<typeof CreateCommentSchema>;

/**
 * Create new issue
 */
export async function createIssue(
  input: CreateIssueInput,
  createdBy: string,
  createdByType: "user" | "agent" = "user",
): Promise<any> {
  // 1. Validate input
  const validated = CreateIssueSchema.parse(input);

  // 2. Create issue
  const db = getDatabase();
  const issueId = generateId();
  const now = new Date();

  const newIssue = {
    id: issueId,
    projectId: validated.projectId,
    title: validated.title,
    description: validated.description,
    status: validated.status,
    priority: validated.priority,
    type: validated.type,
    assigneeId: validated.assigneeId,
    assigneeType: validated.assigneeType,
    estimatedHours: validated.estimatedHours,
    actualHours: null,
    storyPoints: validated.storyPoints,
    labels: validated.labels,
    gitBranch: null,
    gitCommits: null,
    pullRequestUrl: null,
    metadata: null,
    createdBy,
    createdByType,
    dueDate: validated.dueDate,
    startedAt: null,
    completedAt: null,
    createdAt: now,
    updatedAt: now,
  };

  await db.insert(issues).values(newIssue);

  // 3. Create activity log
  await createIssueActivity(
    issueId,
    "created",
    "Issue created",
    null,
    null,
    createdBy,
    createdByType,
  );

  return newIssue;
}

/**
 * Find issue by ID
 */
export async function findIssueById(issueId: string): Promise<any | null> {
  const db = getDatabase();

  const issue = await db.query.issues.findFirst({
    where: eq(issues.id, issueId),
  });

  if (!issue) return null;

  return {
    ...issue,
    labels: issue.labels ? JSON.parse(issue.labels) : [],
    metadata: issue.metadata ? JSON.parse(issue.metadata) : {},
  };
}

/**
 * Find issues by project
 */
export async function findIssuesByProject(
  projectId: string,
  filters?: {
    status?: string;
    assigneeId?: string;
    priority?: string;
    type?: string;
  },
): Promise<any[]> {
  const db = getDatabase();

  const whereConditions = [eq(issues.projectId, projectId)];

  if (filters?.status) {
    whereConditions.push(eq(issues.status, filters.status));
  }
  if (filters?.assigneeId) {
    whereConditions.push(eq(issues.assigneeId, filters.assigneeId));
  }
  if (filters?.priority) {
    whereConditions.push(eq(issues.priority, filters.priority));
  }
  if (filters?.type) {
    whereConditions.push(eq(issues.type, filters.type));
  }

  const projectIssues = await db.query.issues.findMany({
    where: and(...whereConditions),
    orderBy: [desc(issues.createdAt)],
  });

  return projectIssues.map((issue) => ({
    ...issue,
    labels: issue.labels ? JSON.parse(issue.labels) : [],
    metadata: issue.metadata ? JSON.parse(issue.metadata) : {},
  }));
}

/**
 * Update issue
 */
export async function updateIssue(
  issueId: string,
  input: UpdateIssueInput,
  updatedBy: string,
  updatedByType: "user" | "agent" = "user",
): Promise<any> {
  // 1. Validate input
  const validated = UpdateIssueSchema.parse(input);

  // 2. Get current issue
  const db = getDatabase();
  const currentIssue = await db.query.issues.findFirst({
    where: eq(issues.id, issueId),
  });

  if (!currentIssue) {
    throw new Error("Issue not found");
  }

  // 3. Update issue
  const updateData = {
    ...validated,
    updatedAt: new Date(),
  };

  await db.update(issues).set(updateData).where(eq(issues.id, issueId));

  // 4. Create activity logs for changes
  for (const [key, newValue] of Object.entries(validated)) {
    if (newValue !== undefined) {
      const oldValue = currentIssue[key as keyof typeof currentIssue];
      if (oldValue !== newValue) {
        await createIssueActivity(
          issueId,
          "updated",
          `${key} changed`,
          String(oldValue),
          String(newValue),
          updatedBy,
          updatedByType,
        );
      }
    }
  }

  return await findIssueById(issueId);
}

/**
 * Delete issue
 */
export async function deleteIssue(
  issueId: string,
  deletedBy: string,
  deletedByType: "user" | "agent" = "user",
): Promise<void> {
  const db = getDatabase();

  // Create activity log before deletion
  await createIssueActivity(
    issueId,
    "deleted",
    "Issue deleted",
    null,
    null,
    deletedBy,
    deletedByType,
  );

  await db.delete(issues).where(eq(issues.id, issueId));
}

/**
 * Add comment to issue
 */
export async function addIssueComment(
  input: CreateCommentInput,
  authorId: string,
  authorType: "user" | "agent" = "user",
): Promise<any> {
  // 1. Validate input
  const validated = CreateCommentSchema.parse(input);

  // 2. Create comment
  const db = getDatabase();
  const commentId = generateId();
  const now = new Date();

  const newComment = {
    id: commentId,
    issueId: validated.issueId,
    content: validated.content,
    contentType: validated.contentType,
    authorId,
    authorType,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
  };

  await db.insert(issueComments).values(newComment);

  // 3. Create activity log
  await createIssueActivity(
    validated.issueId,
    "commented",
    "Comment added",
    null,
    null,
    authorId,
    authorType,
  );

  return newComment;
}

/**
 * Get issue comments
 */
export async function getIssueComments(issueId: string): Promise<any[]> {
  const db = getDatabase();

  return await db.query.issueComments.findMany({
    where: and(eq(issueComments.issueId, issueId)),
    orderBy: [issueComments.createdAt],
  });
}

/**
 * Get issue activities
 */
export async function getIssueActivities(issueId: string): Promise<any[]> {
  const db = getDatabase();

  return await db.query.issueActivities.findMany({
    where: eq(issueActivities.issueId, issueId),
    orderBy: [desc(issueActivities.createdAt)],
  });
}

// Helper function to create issue activity
async function createIssueActivity(
  issueId: string,
  activityType: string,
  description: string,
  oldValue: string | null,
  newValue: string | null,
  actorId: string,
  actorType: "user" | "agent",
): Promise<void> {
  const db = getDatabase();
  const activityId = generateId();

  await db.insert(issueActivities).values({
    id: activityId,
    issueId,
    activityType,
    description,
    oldValue,
    newValue,
    actorId,
    actorType,
    metadata: null,
    createdAt: new Date(),
  });
}
