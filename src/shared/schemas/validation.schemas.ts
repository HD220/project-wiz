import { z } from 'zod';

// Common validation schemas
export const IdSchema = z.string().min(1, 'ID is required');

// Auth schemas
export const LoginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

export const RegisterSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  displayName: z.string().min(1, 'Display name is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  email: z.string().email().optional(),
});

// User schemas
export const UpdateUserSchema = z.object({
  username: z.string().min(3).optional(),
  displayName: z.string().min(1).optional(),
  email: z.string().email().optional(),
  bio: z.string().optional(),
  avatarUrl: z.string().url().optional(),
});

// Agent schemas
export const CreateAgentSchema = z.object({
  name: z.string().min(1, 'Agent name is required'),
  description: z.string().optional(),
  role: z.string().min(1, 'Agent role is required'),
  expertise: z.array(z.string()).optional().default([]),
  personality: z.record(z.any()).optional(),
  systemPrompt: z.string().optional(),
  llmProvider: z.enum(['openai', 'deepseek']).default('deepseek'),
  llmModel: z.string().default('deepseek-chat'),
  temperature: z.number().min(0).max(2).default(0.7),
  maxTokens: z.number().min(1).max(8000).default(4000),
});

export const UpdateAgentSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  role: z.string().min(1).optional(),
  expertise: z.array(z.string()).optional(),
  personality: z.record(z.any()).optional(),
  systemPrompt: z.string().optional(),
  llmProvider: z.enum(['openai', 'deepseek']).optional(),
  llmModel: z.string().optional(),
  temperature: z.number().min(0).max(2).optional(),
  maxTokens: z.number().min(1).max(8000).optional(),
});

// Project schemas
export const CreateProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
  description: z.string().optional(),
  gitUrl: z.string().url().optional(),
  iconEmoji: z.string().optional(),
});

export const UpdateProjectSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  iconEmoji: z.string().optional(),
  settings: z.record(z.any()).optional(),
});

// Channel schemas
export const CreateChannelSchema = z.object({
  projectId: IdSchema,
  name: z.string().min(1, 'Channel name is required'),
  description: z.string().optional(),
  type: z.enum(['text']).default('text'),
  position: z.number().int().min(0).optional(),
});

export const UpdateChannelSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  position: z.number().int().min(0).optional(),
});

// Message schemas
export const SendMessageSchema = z.object({
  content: z.string().min(1, 'Message content is required'),
  channelId: IdSchema.optional(),
  dmConversationId: IdSchema.optional(),
  messageType: z.enum(['text', 'system', 'task_result', 'notification']).default('text'),
  replyToId: IdSchema.optional(),
  metadata: z.record(z.any()).optional(),
}).refine(
  (data) => data.channelId || data.dmConversationId,
  {
    message: 'Either channelId or dmConversationId must be provided',
    path: ['channelId'],
  }
);

// Forum schemas
export const CreateTopicSchema = z.object({
  projectId: IdSchema,
  title: z.string().min(1, 'Topic title is required'),
  description: z.string().optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional().default([]),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
});

export const UpdateTopicSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  status: z.enum(['open', 'closed', 'resolved']).optional(),
  tags: z.array(z.string()).optional(),
});

export const CreatePostSchema = z.object({
  topicId: IdSchema,
  content: z.string().min(1, 'Post content is required'),
  contentType: z.enum(['markdown', 'code', 'image']).default('markdown'),
  replyToId: IdSchema.optional(),
});

// Issue schemas
export const CreateIssueSchema = z.object({
  projectId: IdSchema,
  title: z.string().min(1, 'Issue title is required'),
  description: z.string().optional(),
  type: z.enum(['task', 'bug', 'feature', 'epic', 'story']).default('task'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  assigneeId: IdSchema.optional(),
  assigneeType: z.enum(['user', 'agent']).optional(),
  labels: z.array(z.string()).optional().default([]),
  estimatedHours: z.number().positive().optional(),
  dueDate: z.date().optional(),
});

export const UpdateIssueSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  status: z.enum(['todo', 'in_progress', 'review', 'done', 'cancelled']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  labels: z.array(z.string()).optional(),
  estimatedHours: z.number().positive().optional(),
  actualHours: z.number().positive().optional(),
  dueDate: z.date().optional(),
});

export const AddCommentSchema = z.object({
  issueId: IdSchema,
  content: z.string().min(1, 'Comment content is required'),
  contentType: z.enum(['markdown', 'code']).default('markdown'),
});

// Pagination schema
export const ListOptionsSchema = z.object({
  limit: z.number().int().min(1).max(100).default(50),
  offset: z.number().int().min(0).default(0),
  before: z.string().optional(),
  after: z.string().optional(),
});

// Export type definitions
export type LoginInput = z.infer<typeof LoginSchema>;
export type RegisterInput = z.infer<typeof RegisterSchema>;
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;
export type CreateAgentInput = z.infer<typeof CreateAgentSchema>;
export type UpdateAgentInput = z.infer<typeof UpdateAgentSchema>;
export type CreateProjectInput = z.infer<typeof CreateProjectSchema>;
export type UpdateProjectInput = z.infer<typeof UpdateProjectSchema>;
export type CreateChannelInput = z.infer<typeof CreateChannelSchema>;
export type UpdateChannelInput = z.infer<typeof UpdateChannelSchema>;
export type SendMessageInput = z.infer<typeof SendMessageSchema>;
export type CreateTopicInput = z.infer<typeof CreateTopicSchema>;
export type UpdateTopicInput = z.infer<typeof UpdateTopicSchema>;
export type CreatePostInput = z.infer<typeof CreatePostSchema>;
export type CreateIssueInput = z.infer<typeof CreateIssueSchema>;
export type UpdateIssueInput = z.infer<typeof UpdateIssueSchema>;
export type AddCommentInput = z.infer<typeof AddCommentSchema>;
export type ListOptions = z.infer<typeof ListOptionsSchema>;