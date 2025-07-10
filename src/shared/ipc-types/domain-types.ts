import { z } from "zod";

// BaseEntity structure (simplified for IPC)
export interface IBaseEntity {
  id: string;
}

// DirectMessage
export const DirectMessagePropsSchema = z.object({
  senderId: z.string().min(1, "Sender ID cannot be empty"),
  receiverId: z.string().min(1, "Receiver ID cannot be empty"),
  content: z.string().min(1, "Message content cannot be empty"),
  timestamp: z.date(),
});

export type IDirectMessageProps = z.infer<typeof DirectMessagePropsSchema>;

export interface IDirectMessage extends IBaseEntity {
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: Date;
}

// Project
export const ProjectPropsSchema = z.object({
  name: z.string().min(1, "Project name cannot be empty"),
  createdAt: z.date(),
});

export type IProjectProps = z.infer<typeof ProjectPropsSchema>;

export interface IProject extends IBaseEntity {
  name: string;
  createdAt: Date;
}

// ForumTopic
export const ForumTopicPropsSchema = z.object({
  title: z.string().min(1, "Topic title cannot be empty"),
  authorId: z.string().min(1, "Author ID cannot be empty"),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type IForumTopicProps = z.infer<typeof ForumTopicPropsSchema>;

export interface IForumTopic extends IBaseEntity {
  title: string;
  authorId: string;
  createdAt: Date;
  updatedAt: Date;
}

// ForumPost
export const ForumPostPropsSchema = z.object({
  topicId: z.string().min(1, "Topic ID cannot be empty"),
  authorId: z.string().min(1, "Author ID cannot be empty"),
  content: z.string().min(1, "Post content cannot be empty"),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type IForumPostProps = z.infer<typeof ForumPostPropsSchema>;

export interface IForumPost extends IBaseEntity {
  topicId: string;
  authorId: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

// Persona
export interface IPersona extends IBaseEntity {
  name: string;
  description: string;
  llmConfig: { model: string; temperature: number };
  tools: string[];
}

// UserSetting
export interface IUserSetting extends IBaseEntity {
  userId: string;
  key: string;
  value: string;
}

// LlmConfig
export interface ILlmConfig extends IBaseEntity {
  provider: string;
  model: string;
  apiKey: string;
  temperature: number;
  maxTokens: number;
}

// ProjectStack
export interface IProjectStack {
  languages: { [key: string]: number };
  frameworks: string[];
  libraries: string[];
}
