// src_refactored/shared/ipc-channels.ts

/**
 * Defines the IPC channels used for communication between the main and renderer processes.
 * Follows a pattern: <context>:<action>
 * For events from main to renderer, a suffix like '_UPDATED' or '_EVENT' can be used.
 */
export const IPC_CHANNELS = {
  // --- Project Management ---
  GET_PROJECTS_LIST: 'projects:get-list', // Args: void, Returns: Project[]
  GET_PROJECT_DETAILS: 'projects:get-details', // Args: { projectId: string }, Returns: Project | null
  CREATE_PROJECT: 'projects:create', // Args: ProjectFormData, Returns: Project
  UPDATE_PROJECT: 'projects:update', // Args: { projectId: string, data: Partial<ProjectFormData> }, Returns: Project
  DELETE_PROJECT: 'projects:delete', // Args: { projectId: string }, Returns: { success: boolean }
  PROJECTS_UPDATED_EVENT: 'projects:updated-event', // Event from main to renderer, Payload: Project[] (or updated/deleted project)

  // --- Persona Templates ---
  GET_PERSONA_TEMPLATES_LIST: 'persona-templates:get-list', // Args: void, Returns: PersonaTemplate[]
  GET_PERSONA_TEMPLATE_DETAILS: 'persona-templates:get-details', // Args: { templateId: string }, Returns: PersonaTemplate | null
  CREATE_PERSONA_TEMPLATE: 'persona-templates:create', // Args: PersonaTemplateFormData, Returns: PersonaTemplate
  UPDATE_PERSONA_TEMPLATE: 'persona-templates:update', // Args: { templateId: string, data: Partial<PersonaTemplateFormData> }, Returns: PersonaTemplate
  DELETE_PERSONA_TEMPLATE: 'persona-templates:delete', // Args: { templateId: string }, Returns: { success: boolean }
  PERSONA_TEMPLATES_UPDATED_EVENT: 'persona-templates:updated-event', // Event

  // --- Agent Instances ---
  GET_AGENT_INSTANCES_LIST: 'agent-instances:get-list', // Args: void, Returns: AgentInstance[] (enriched with names)
  GET_AGENT_INSTANCE_DETAILS: 'agent-instances:get-details', // Args: { agentId: string }, Returns: AgentInstance | null (enriched)
  CREATE_AGENT_INSTANCE: 'agent-instances:create', // Args: AgentInstanceFormData, Returns: AgentInstance (enriched)
  UPDATE_AGENT_INSTANCE: 'agent-instances:update', // Args: { agentId: string, data: Partial<AgentInstanceFormData> }, Returns: AgentInstance (enriched)
  DELETE_AGENT_INSTANCE: 'agent-instances:delete', // Args: { agentId: string }, Returns: { success: boolean }
  AGENT_INSTANCES_UPDATED_EVENT: 'agent-instances:updated-event', // Event

  // --- LLM Configurations ---
  GET_LLM_CONFIGS_LIST: 'llm-configs:get-list', // Args: void, Returns: LLMConfig[]
  GET_LLM_CONFIG_DETAILS: 'llm-configs:get-details', // Args: { configId: string }, Returns: LLMConfig | null
  CREATE_LLM_CONFIG: 'llm-configs:create', // Args: LLMConfigFormData, Returns: LLMConfig
  UPDATE_LLM_CONFIG: 'llm-configs:update', // Args: { configId: string, data: Partial<LLMConfigFormData> }, Returns: LLMConfig
  DELETE_LLM_CONFIG: 'llm-configs:delete', // Args: { configId: string }, Returns: { success: boolean }
  LLM_CONFIGS_UPDATED_EVENT: 'llm-configs:updated-event', // Event

  // --- User Profile & Settings ---
  GET_USER_PROFILE: 'user:get-profile', // Args: void, Returns: UserProfile
  UPDATE_USER_PROFILE: 'user:update-profile', // Args: Partial<UserProfileFormData>, Returns: UserProfile
  GET_APP_SETTINGS: 'app:get-settings', // Args: void, Returns: AppSettings (e.g., theme)
  UPDATE_APP_SETTINGS: 'app:update-settings', // Args: Partial<AppSettings>, Returns: AppSettings
  APP_SETTINGS_UPDATED_EVENT: 'app:settings-updated-event', // Event

  // --- Direct Messages (DMs) & Chat ---
  GET_DM_CONVERSATIONS_LIST: 'dms:get-list', // Args: void, Returns: DirectMessageItem[] (for UserSidebar)
  GET_DM_MESSAGES: 'dms:get-messages', // Args: { conversationId: string }, Returns: ChatMessage[]
  SEND_DM_MESSAGE: 'dms:send-message', // Args: { conversationId: string, content: string }, Returns: ChatMessage (the new message)
  DM_MESSAGE_RECEIVED_EVENT: 'dms:message-received-event', // Event, Payload: { conversationId: string, message: ChatMessage }
  DM_CONVERSATION_UPDATED_EVENT: 'dms:conversation-updated-event', // Event for updates to DM list (e.g., new DM, unread count)

  // --- Project Specific Chat Channels (Example, if needed later) ---
  // GET_PROJECT_CHANNELS_LIST: 'project-chat:get-channels', // Args: { projectId: string }, Returns: ProjectChannel[]
  // GET_PROJECT_CHANNEL_MESSAGES: 'project-chat:get-messages', // Args: { projectId: string, channelId: string }, Returns: ChatMessage[]
  // SEND_PROJECT_CHANNEL_MESSAGE: 'project-chat:send-message', // Args: { projectId: string, channelId: string, content: string }, Returns: ChatMessage
  // PROJECT_CHANNEL_MESSAGE_RECEIVED_EVENT: 'project-chat:message-received-event', // Payload: { projectId: string, channelId: string, message: ChatMessage }
};

// It's also good practice to define the expected payload types for these channels,
// often in a separate `ipc-payload-types.ts` or alongside the shared entity types.
// For now, comments indicate args and return types.
// Example (would be in a different file or a larger types definition):
//
// export interface Project { id: string; name: string; description?: string; /* ...other fields */ }
// export interface ProjectFormData { name: string; description?: string; }
//
// export type GetProjectsListResponse = Project[];
// export type GetProjectDetailsArgs = { projectId: string };
// export type GetProjectDetailsResponse = Project | null;
// etc.
// These types would then be used by both main and renderer IPC handlers/hooks.
// The UI-specific types (like ProjectListItem which might have extra UI state)
// can still exist in the UI layer, but the core data types should be shared.
// For this plan, we'll assume the interfaces already defined in the UI features
// (Project, PersonaTemplate, AgentInstance, LLMConfig, ChatMessage, DirectMessageItem)
// will serve as these shared types or be easily adaptable.
// The Form Data types (ProjectFormData, etc.) are also relevant for create/update operations.
// UserProfile and AppSettings types would also need to be defined.
// export interface UserProfile { displayName: string; email: string; avatarUrl?: string; }
// export interface UserProfileFormData { displayName: string; }
// export interface AppSettings { theme: 'light' | 'dark' | 'system'; }
//
// For events like PROJECTS_UPDATED_EVENT, the payload might be the full new list,
// or just the changed/added/deleted item(s) for more granular updates.
// For simplicity initially, sending the full updated list is easier.
// Example for an event payload:
// export type ProjectsUpdatedEventPayload = Project[];
// export type DmMessageReceivedEventPayload = { conversationId: string; message: ChatMessage };
//
// The `invoke` calls will typically return a structure like:
// { success: boolean, data?: T, error?: string }
// This will be handled by the calling hook.
// The hook itself will then provide a simpler { data, isLoading, error } interface to the UI component.
// For `useSyncExternalStore`, the store will hold `data`, and the hook will manage `isLoading` and `error` separately.
// The event channels (`..._EVENT`) will be used by the `subscribe` part of `useSyncExternalStore`
// to trigger re-renders when the main process pushes updates.
// The main process will use `mainWindow.webContents.send(IPC_CHANNELS.SOME_UPDATED_EVENT, updatedData)`
// after a mutation (create, update, delete) that it handles.
//
// The initial data load for a store will use an `invoke` channel (e.g., GET_PROJECTS_LIST).
// The `on` listeners in preload will be generic, and the specific channel listeners will be in the stores/hooks.
// window.electronIPC.on(channel, (event, payload) => { /* store.update(payload) */ });
// The `subscribe` function for `useSyncExternalStore` will return the unsubscribe function from `window.electronIPC.on`.
//
// Initial plan will focus on GET_..._LIST channels for populating lists.
// Details, Create, Update, Delete will be simulated in UI handlers for now,
// but the channels are defined for future backend integration.
// The `..._UPDATED_EVENT` channels are crucial for `useSyncExternalStore` to work effectively.
// Main process handlers for CUD operations should emit these events after data changes.
// Example: After `CREATE_PROJECT` successfully saves a new project, main process should then
// fetch the new list of all projects and send it via `PROJECTS_UPDATED_EVENT`.
// Or, more efficiently, just send the new project and let the renderer's store merge it.
// For now, we'll assume the events might carry the full updated list for simplicity in the store.
