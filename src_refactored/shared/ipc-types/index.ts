// src_refactored/shared/ipc-types/index.ts

// Export all shared entity types from the new central location
export * from "../types/entities";

// --- IPC Payloads and Response Structures ---

// Import necessary entity types if they are not globally available through re-export
import type {
  Project,
  ProjectFormData,
  PersonaTemplate,
  PersonaTemplateFormData,
  AgentInstance,
  AgentInstanceFormData,
  LLMConfig,
  LLMConfigFormData,
  ChatMessage,
  DirectMessageItem,
  UserProfile,
  UserProfileFormData,
  AppSettings,
} from "../types/entities";

// General structure for invoke responses from main process
export type IPCResponse<T = unknown> =
  | { success: true; data: T }
  | {
      success: false;
      error: { message: string; name?: string; stack?: string };
    };

// Specific Request/Response types

// Projects
export type GetProjectsListRequest = void;
export type GetProjectsListResponseData = Project[];

export type GetProjectDetailsRequest = { projectId: string };
export type GetProjectDetailsResponseData = Project | null;

export type CreateProjectRequest = ProjectFormData;
export type CreateProjectResponseData = Project;

export type UpdateProjectRequest = {
  projectId: string;
  data: Partial<ProjectFormData>;
};
export type UpdateProjectResponseData = Project;

export type DeleteProjectRequest = { projectId: string };
export type DeleteProjectResponseData = { success: boolean };

export type ProjectsUpdatedEventPayload = Project[];

// Persona Templates
export type GetPersonaTemplatesListRequest = void;
export type GetPersonaTemplatesListResponseData = PersonaTemplate[];

export type GetPersonaTemplateDetailsRequest = { templateId: string };
export type GetPersonaTemplateDetailsResponseData = PersonaTemplate | null;

export type CreatePersonaTemplateRequest = PersonaTemplateFormData;
export type CreatePersonaTemplateResponseData = PersonaTemplate;

export type UpdatePersonaTemplateRequest = {
  templateId: string;
  data: Partial<PersonaTemplateFormData>;
};
export type UpdatePersonaTemplateResponseData = PersonaTemplate;

export type DeletePersonaTemplateRequest = { templateId: string };
export type DeletePersonaTemplateResponseData = { success: boolean };

export type PersonaTemplatesUpdatedEventPayload = PersonaTemplate[];

// Agent Instances
export type GetAgentInstancesListRequest = void;
export type GetAgentInstancesListResponseData = AgentInstance[];

export type GetAgentInstancesByProjectRequest = { projectId: string };

export type GetAgentInstanceDetailsRequest = { agentId: string };
export type GetAgentInstanceDetailsResponseData = AgentInstance | null;

export type CreateAgentInstanceRequest = AgentInstanceFormData;
export type CreateAgentInstanceResponseData = AgentInstance;

export type UpdateAgentInstanceRequest = {
  agentId: string;
  data: Partial<AgentInstanceFormData>;
};
export type UpdateAgentInstanceResponseData = AgentInstance;

export type DeleteAgentInstanceRequest = { agentId: string };
export type DeleteAgentInstanceResponseData = { success: boolean };

export type AgentInstancesUpdatedEventPayload = AgentInstance[];

// LLM Configurations
export type GetLLMConfigsListRequest = void;
export type GetLLMConfigsListResponseData = LLMConfig[];

export type GetAvailableLLMsResponseData = LLMConfig[];

export type GetLLMConfigDetailsRequest = { configId: string };
export type GetLLMConfigDetailsResponseData = LLMConfig | null;

export type CreateLLMConfigRequest = LLMConfigFormData;
export type CreateLLMConfigResponseData = LLMConfig;

export type UpdateLLMConfigRequest = {
  configId: string;
  data: Partial<LLMConfigFormData>;
};
export type UpdateLLMConfigResponseData = LLMConfig;

export type DeleteLLMConfigRequest = { configId: string };
export type DeleteLLMConfigResponseData = { success: boolean };

export type LLMConfigsUpdatedEventPayload = LLMConfig[];

// User Profile
export type GetUserProfileRequest = void;
export type GetUserProfileResponseData = UserProfile | null;

export type UpdateUserProfileRequest = UserProfileFormData;
export type UpdateUserProfileResponseData = UserProfile;

// App Settings
export type GetAppSettingsRequest = void;
export type GetAppSettingsResponseData = AppSettings;

export type UpdateAppSettingsRequest = Partial<AppSettings>;
export type UpdateAppSettingsResponseData = AppSettings;

export type AppSettingsUpdatedEventPayload = AppSettings;

// Direct Messages
export type GetDMConversationsListRequest = void;
export type GetDMConversationsListResponseData = DirectMessageItem[];

export type GetDMDetailsRequest = { dmId: string };
export type GetDMDetailsResponseData = DirectMessageItem | null;

export type GetDMMessagesRequest = { conversationId: string };
export type GetDMMessagesResponseData = ChatMessage[];

export type SendDMMessageRequest = { dmId: string; content: string; senderId: string };
export type SendDMMessageResponseData = ChatMessage;

export type DMMessageReceivedEventPayload = {
  conversationId: string;
  message: ChatMessage;
};
export type DMConversationsUpdatedEventPayload = DirectMessageItem[];

// Suffix 'Data' is added to response types for invoke handlers to distinguish them
// from the general IPCResponse wrapper. E.g. an invoke call returns Promise<IPCResponse<GetProjectsListResponseData>>
