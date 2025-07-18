// Common types used across the application

// API Response wrapper
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

// Pagination
export interface PaginationOptions {
  limit?: number;
  offset?: number;
  before?: string;
  after?: string;
}

// Common status types
export type EntityStatus = 'active' | 'archived' | 'deleted';
export type AgentStatus = 'online' | 'busy' | 'offline';
export type IssueStatus = 'todo' | 'in_progress' | 'review' | 'done' | 'cancelled';
export type IssuePriority = 'low' | 'medium' | 'high' | 'urgent';
export type IssueType = 'task' | 'bug' | 'feature' | 'epic' | 'story';
export type MessageType = 'text' | 'system' | 'task_result' | 'notification';
export type AuthorType = 'user' | 'agent';
export type ContentType = 'text' | 'markdown' | 'code' | 'image';

// User types
export interface User {
  id: string;
  username: string;
  displayName: string;
  email?: string;
  avatarUrl?: string;
  bio?: string;
  preferences: Record<string, any>;
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Agent types
export interface Agent {
  id: string;
  name: string;
  description?: string;
  role: string;
  expertise: string[];
  personality?: Record<string, any>;
  systemPrompt: string;
  avatarUrl?: string;
  status: AgentStatus;
  isGlobal: boolean;
  llmProvider: string;
  llmModel: string;
  temperature: number;
  maxTokens: number;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// Project types
export interface Project {
  id: string;
  name: string;
  description?: string;
  gitUrl?: string;
  localPath?: string;
  iconUrl?: string;
  iconEmoji?: string;
  visibility: 'private' | 'internal';
  status: EntityStatus;
  settings: Record<string, any>;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}

// Channel types
export interface Channel {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  type: 'text';
  position: number;
  isPrivate: boolean;
  permissions?: Record<string, any>;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// Message types
export interface Message {
  id: string;
  channelId?: string;
  dmConversationId?: string;
  content: string;
  contentType: ContentType;
  authorId: string;
  authorType: AuthorType;
  messageType: MessageType;
  metadata?: Record<string, any>;
  replyToId?: string;
  threadId?: string;
  createdAt: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

// DM Conversation types
export interface DmConversation {
  id: string;
  userId: string;
  agentId: string;
  isActive: boolean;
  isPinned: boolean;
  lastMessageAt?: Date;
  lastReadAt?: Date;
  unreadCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// Forum types
export interface ForumTopic {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  status: 'open' | 'closed' | 'resolved';
  priority: IssuePriority;
  category?: string;
  tags: string[];
  createdBy: string;
  createdByType: AuthorType;
  viewCount: number;
  postCount: number;
  lastActivityAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ForumPost {
  id: string;
  topicId: string;
  content: string;
  contentType: ContentType;
  authorId: string;
  authorType: AuthorType;
  replyToId?: string;
  position: number;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

// Issue types
export interface Issue {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  status: IssueStatus;
  priority: IssuePriority;
  type: IssueType;
  assigneeId?: string;
  assigneeType?: AuthorType;
  estimatedHours?: number;
  actualHours?: number;
  storyPoints?: number;
  labels: string[];
  gitBranch?: string;
  gitCommits: string[];
  pullRequestUrl?: string;
  metadata?: Record<string, any>;
  createdBy: string;
  createdByType: AuthorType;
  dueDate?: Date;
  startedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IssueComment {
  id: string;
  issueId: string;
  content: string;
  contentType: ContentType;
  authorId: string;
  authorType: AuthorType;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface IssueActivity {
  id: string;
  issueId: string;
  activityType: string;
  description: string;
  oldValue?: string;
  newValue?: string;
  actorId: string;
  actorType: AuthorType | 'system';
  metadata?: Record<string, any>;
  createdAt: Date;
}

// Project relationship types
export interface ProjectAgent {
  projectId: string;
  agentId: string;
  role?: string;
  permissions: string[];
  isActive: boolean;
  addedBy: string;
  addedAt: Date;
  removedAt?: Date;
}

export interface ProjectUser {
  projectId: string;
  userId: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  permissions: string[];
  joinedAt: Date;
  leftAt?: Date;
}

// Error types
export class APIError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public details?: any,
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export class ValidationError extends APIError {
  constructor(message: string, details?: any) {
    super(message, 'VALIDATION_ERROR', 400, details);
  }
}

export class NotFoundError extends APIError {
  constructor(resource: string, id: string) {
    super(`${resource} not found: ${id}`, 'NOT_FOUND', 404);
  }
}

export class AuthenticationError extends APIError {
  constructor(message: string = 'Authentication required') {
    super(message, 'AUTHENTICATION_ERROR', 401);
  }
}

export class AuthorizationError extends APIError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 'AUTHORIZATION_ERROR', 403);
  }
}