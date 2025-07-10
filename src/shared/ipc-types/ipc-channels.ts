export enum IpcChannel {
  // Forum Module
  FORUM_LIST_TOPICS = "forum:list-topics",
  FORUM_CREATE_TOPIC = "forum:create-topic",
  FORUM_LIST_POSTS = "forum:list-posts",
  FORUM_CREATE_POST = "forum:create-post",

  // Project Management Module
  PROJECT_CREATE = "project:create",
  PROJECT_LIST = "project:list",
  PROJECT_REMOVE = "project:remove",

  // Direct Messages Module
  DIRECT_MESSAGES_SEND = "direct-messages:send",
  DIRECT_MESSAGES_LIST = "direct-messages:list",

  // Persona Management Module
  PERSONA_REFINE_SUGGESTION = "persona:refine-suggestion",
  PERSONA_CREATE = "persona:create",
  PERSONA_LIST = "persona:list",
  PERSONA_REMOVE = "persona:remove",

  // User Settings Module
  USER_SETTINGS_SAVE = "user-settings:save",
  USER_SETTINGS_GET = "user-settings:get",
  USER_SETTINGS_LIST = "user-settings:list",

  // LLM Integration Module
  LLM_CONFIG_SAVE = "llm-config:save",
  LLM_CONFIG_GET = "llm-config:get",
  LLM_CONFIG_LIST = "llm-config:list",
  LLM_CONFIG_REMOVE = "llm-config:remove",

  // Code Analysis Module
  CODE_ANALYSIS_ANALYZE_STACK = "code-analysis:analyze-stack",

  // Filesystem Tools Module
  FILESYSTEM_LIST_DIRECTORY = "filesystem:list-directory",
  FILESYSTEM_READ_FILE = "filesystem:read-file",
  FILESYSTEM_SEARCH_FILE_CONTENT = "filesystem:search-file-content",
  FILESYSTEM_WRITE_FILE = "filesystem:write-file",

  // Git Integration Module
  GIT_INTEGRATION_CLONE = "git:clone",
  GIT_INTEGRATION_INITIALIZE = "git:initialize",
  GIT_INTEGRATION_PULL = "git:pull",

  // Automatic Persona Hiring Module
  AUTOMATIC_PERSONA_HIRING_HIRE = "automatic-persona-hiring:hire",
}
