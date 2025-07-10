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

// User Settings Module
export interface IpcUserSettingsSavePayload {
  userId: string;
  key: string;
  value: string;
}
export type IpcUserSettingsSaveResponse = IpcResponse<IUserSetting>;
export interface IpcUserSettingsGetPayload {
  userId: string;
  key: string;
}
export type IpcUserSettingsGetResponse = IpcResponse<IUserSetting | undefined>;
export interface IpcUserSettingsListPayload {
  userId: string;
}
export type IpcUserSettingsListResponse = IpcResponse<IUserSetting[]>;

// LLM Integration Module
export interface IpcLlmConfigSavePayload {
  id?: string;
  provider: string;
  model: string;
  apiKey: string;
  temperature: number;
  maxTokens: number;
}
export type IpcLlmConfigSaveResponse = IpcResponse<ILlmConfig>;
export interface IpcLlmConfigGetPayload {
  id?: string;
  provider?: string;
  model?: string;
}
export type IpcLlmConfigGetResponse = IpcResponse<ILlmConfig | undefined>;
export type IpcLlmConfigListPayload = Record<string, never>;
export type IpcLlmConfigListResponse = IpcResponse<ILlmConfig[]>;
export interface IpcLlmConfigRemovePayload {
  id: string;
}
export type IpcLlmConfigRemoveResponse = IpcResponse<boolean>;

export interface IpcResponse<T> {
  success: boolean;
  data?: T;
  error?: { message: string };
}

// Code Analysis Module
export interface IpcCodeAnalysisAnalyzeStackPayload {
  projectPath: string;
}
export type IpcCodeAnalysisAnalyzeStackResponse = IpcResponse<IProjectStack>;

// Forum Module
export type IpcForumListTopicsResponse = IpcResponse<IForumTopic[]>;
export interface IpcForumCreateTopicPayload {
  title: string;
  authorId: string;
}
export type IpcForumCreateTopicResponse = IpcResponse<IForumTopic>;
export interface IpcForumListPostsPayload {
  topicId: string;
}
export type IpcForumListPostsResponse = IpcResponse<IForumPost[]>;
export interface IpcForumCreatePostPayload {
  topicId: string;
  authorId: string;
  content: string;
}
export type IpcForumCreatePostResponse = IpcResponse<IForumPost>;

// Project Management Module
export interface IpcProjectCreatePayload {
  name: string;
}
export type IpcProjectCreateResponse = IpcResponse<IProject>;
export type IpcProjectListPayload = Record<string, never>;
export type IpcProjectListResponse = IpcResponse<IProject[]>;
export interface IpcProjectRemovePayload {
  id: string;
}
export type IpcProjectRemoveResponse = IpcResponse<boolean>;

// Direct Messages Module
export interface IpcDirectMessagesSendPayload {
  senderId: string;
  receiverId: string;
  content: string;
}
export type IpcDirectMessagesSendResponse = IpcResponse<IDirectMessage>;
export interface IpcDirectMessagesListPayload {
  senderId: string;
  receiverId: string;
}
export type IpcDirectMessagesListResponse = IpcResponse<IDirectMessage[]>;

// Persona Management Module
export interface IpcPersonaRefineSuggestionPayload {
  name: string;
  description: string;
  llmModel?: string;
  llmTemperature?: number;
  tools?: string[];
}
export type IpcPersonaRefineSuggestionResponse = IpcResponse<IPersona>;
export interface IpcPersonaCreatePayload {
  name: string;
  description: string;
  llmModel: string;
  llmTemperature: number;
  tools: string[];
}
export type IpcPersonaCreateResponse = IpcResponse<IPersona>;
export type IpcPersonaListPayload = Record<string, never>;
export type IpcPersonaListResponse = IpcResponse<IPersona[]>;
export interface IpcPersonaRemovePayload {
  id: string;
}
export type IpcPersonaRemoveResponse = IpcResponse<boolean>;

// Automatic Persona Hiring Module
export interface IpcAutomaticPersonaHiringHirePayload {
  projectId: string;
  projectPath: string;
}
export type IpcAutomaticPersonaHiringHireResponse = IpcResponse<boolean>;
