export const IPC_CHANNELS = {
  // --- Project Management ---
  GET_PROJECTS_LIST: "projects:get-list",
  PROJECT_LIST_QUERY: "projects:list-query",
  GET_PROJECT_DETAILS: "projects:get-details",
  CREATE_PROJECT: "projects:create",
  UPDATE_PROJECT: "projects:update",
  DELETE_PROJECT: "projects:delete",
  PROJECTS_UPDATED_EVENT: "projects:updated-event",

  // --- Persona Templates ---
  GET_PERSONA_TEMPLATES_LIST: "persona-templates:get-list",
  GET_PERSONA_TEMPLATE_DETAILS: "persona-templates:get-details",
  CREATE_PERSONA_TEMPLATE: "persona-templates:create",
  UPDATE_PERSONA_TEMPLATE: "persona-templates:update",
  DELETE_PERSONA_TEMPLATE: "persona-templates:delete",
  PERSONA_TEMPLATES_UPDATED_EVENT: "persona-templates:updated-event",

  // --- Agent Instances ---
  GET_AGENT_INSTANCES_LIST: "agent-instances:get-list",
  GET_AGENT_INSTANCES_BY_PROJECT: "agent-instances:get-by-project",
  GET_AGENT_INSTANCE_DETAILS: "agent-instances:get-details",
  CREATE_AGENT_INSTANCE: "agent-instances:create",
  UPDATE_AGENT_INSTANCE: "agent-instances:update",
  DELETE_AGENT_INSTANCE: "agent-instances:delete",
  AGENT_INSTANCES_UPDATED_EVENT: "agent-instances:updated-event",

  // --- LLM Configurations ---
  GET_LLM_CONFIGS_LIST: "llm-configs:get-list",
  GET_AVAILABLE_LLMS: "llm-configs:get-available-llms",
  GET_LLM_CONFIG_DETAILS: "llm-configs:get-details",
  CREATE_LLM_CONFIG: "llm-configs:create",
  UPDATE_LLM_CONFIG: "llm-configs:update",
  DELETE_LLM_CONFIG: "llm-configs:delete",
  LLM_CONFIGS_UPDATED_EVENT: "llm-configs:updated-event",

  // --- User Profile & Settings ---
  GET_USER_PROFILE: "user:get-profile",
  UPDATE_USER_PROFILE: "user:update-profile",
  GET_APP_SETTINGS: "app:get-settings",
  UPDATE_APP_SETTINGS: "app:update-settings",
  APP_SETTINGS_UPDATED_EVENT: "app:settings-updated-event",

  // --- Direct Messages (DMs) & Chat ---
  GET_DM_CONVERSATIONS_LIST: "dms:get-list",
  GET_DM_DETAILS: "dms:get-details",
  GET_DM_MESSAGES: "dms:get-messages",
  SEND_DM_MESSAGE: "dms:send-message",
  DM_MESSAGE_RECEIVED_EVENT: "dms:message-received-event",
  DM_CONVERSATION_UPDATED_EVENT: "dms:conversation-updated-event",

  // --- Chat ---
  CHAT_SEND_MESSAGE: "chat:send-message",
  CHAT_STREAM_EVENT: "chat:stream-event",
};
