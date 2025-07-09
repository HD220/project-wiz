import { IForumTopic, IForumPost, IProject, IDirectMessage, IPersona, IUserSetting, ILlmConfig, IpcLlmConfigSavePayload, IpcLlmConfigSaveResponse, IpcLlmConfigGetPayload, IpcLlmConfigGetResponse, IpcLlmConfigListPayload, IpcLlmConfigListResponse, IpcLlmConfigRemovePayload, IpcLlmConfigRemoveResponse, IProjectStack } from "./entities";

export interface IpcEvents {
  "forum:list-topics": {
    request: void;
    response: { success: boolean; data?: IForumTopic[]; error?: { message: string } };
  };
  "forum:create-topic": {
    request: { title: string; authorId: string };
    response: { success: boolean; data?: IForumTopic; error?: { message: string } };
  };
  "forum:list-posts": {
    request: { topicId: string };
    response: { success: boolean; data?: IForumPost[]; error?: { message: string } };
  };
  "forum:create-post": {
    request: { topicId: string; authorId: string; content: string };
    response: { success: boolean; data?: IForumPost; error?: { message: string } };
  };
  "project:create": {
    request: { name: string };
    response: { success: boolean; data?: IProject; error?: { message: string } };
  };
  "project:list": {
    request: void;
    response: { success: boolean; data?: IProject[]; error?: { message: string } };
  };
  "project:remove": {
    request: { id: string };
    response: { success: boolean; data?: boolean; error?: { message: string } };
  };
  // Direct Messages Module
  "direct-messages:send": {
    request: { senderId: string; receiverId: string; content: string };
    response: { success: boolean; data?: IDirectMessage; error?: { message: string } };
  };
  "direct-messages:list": {
    request: { senderId: string; receiverId: string };
    response: { success: boolean; data?: IDirectMessage[]; error?: { message: string } };
  };
  // Persona Management Module
  "persona:refine-suggestion": {
    request: { name: string; description: string; llmModel?: string; llmTemperature?: number; tools?: string[] };
    response: { success: boolean; data?: IPersona; error?: { message: string } };
  };
  "persona:create": {
    request: { name: string; description: string; llmModel: string; llmTemperature: number; tools: string[] };
    response: { success: boolean; data?: IPersona; error?: { message: string } };
  };
  "persona:list": {
    request: void;
    response: { success: boolean; data?: IPersona[]; error?: { message: string } };
  };
  "persona:remove": {
    request: { id: string };
    response: { success: boolean; data?: boolean; error?: { message: string } };
  };
  // User Settings Module
  "user-settings:save": {
    request: { userId: string; key: string; value: string };
    response: { success: boolean; data?: IUserSetting; error?: { message: string } };
  };
  "user-settings:get": {
    request: { userId: string; key: string };
    response: { success: boolean; data?: IUserSetting; error?: { message: string } };
  };
  "user-settings:list": {
    request: { userId: string };
    response: { success: boolean; data?: IUserSetting[]; error?: { message: string } };
  };
  // LLM Integration Module
  "llm-config:save": {
    request: { id?: string; provider: string; model: string; apiKey: string; temperature: number; maxTokens: number; };
    response: { success: boolean; data?: ILlmConfig; error?: { message: string } };
  };
  "llm-config:get": {
    request: { id?: string; provider?: string; model?: string; };
    response: { success: boolean; data?: ILlmConfig; error?: { message: string } };
  };
  "llm-config:list": {
    request: void;
    response: { success: boolean; data?: ILlmConfig[]; error?: { message: string } };
  };
  
  // Code Analysis Module
  "code-analysis:analyze-stack": {
    request: { projectPath: string };
    response: { success: boolean; data?: IProjectStack; error?: { message: string } };
  };
}
