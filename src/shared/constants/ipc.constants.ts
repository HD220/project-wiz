export const IPC_CHANNELS = {
  // Window Controls
  WINDOW_MINIMIZE: "window:minimize",
  WINDOW_MAXIMIZE: "window:maximize",
  WINDOW_CLOSE: "window:close",
  WINDOW_IS_MAXIMIZED: "window:is-maximized",

  // App Info
  APP_IS_DEV: "app:is-dev",

  // Agent Operations
  AGENT_CREATE: "agent:create",
  AGENT_GET_BY_ID: "agent:get-by-id",
  AGENT_GET_BY_NAME: "agent:get-by-name",
  AGENT_LIST: "agent:list",
  AGENT_LIST_ACTIVE: "agent:list-active",
  AGENT_UPDATE: "agent:update",
  AGENT_DELETE: "agent:delete",
  AGENT_ACTIVATE: "agent:activate",
  AGENT_DEACTIVATE: "agent:deactivate",
  AGENT_SET_DEFAULT: "agent:set-default",
  AGENT_GET_DEFAULT: "agent:get-default",
} as const;
