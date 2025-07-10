import type {
  IUserSetting,
  ILlmConfig,
  IProjectStack,
  IForumTopic,
  IForumPost,
  IProject,
  IDirectMessage,
  IPersona,
} from "./domain-types";

export interface IpcResponse<T> {
  success: boolean;
  data?: T;
  error?: { message: string };
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
