// Preload script for Electron
// This script has access to node.js APIs and will be executed before the renderer process loads

import { contextBridge, ipcRenderer } from "electron";


// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld("api", {
  // System information
  platform: process.platform,
  version: process.versions.electron,

  // Authentication API (new colocated handlers)
  auth: {
    register: (params) =>
      ipcRenderer.invoke("invoke:auth:register", params),
    login: (credentials) =>
      ipcRenderer.invoke("invoke:auth:login", credentials),
    getCurrent: () =>
      ipcRenderer.invoke("invoke:auth:get-current"),
    getSession: () =>
      ipcRenderer.invoke("invoke:auth:get-session"),
    logout: () => 
      ipcRenderer.invoke("invoke:auth:logout"),
    isLoggedIn: () =>
      ipcRenderer.invoke("invoke:auth:check-login"),
    getUser: (userId) =>
      ipcRenderer.invoke("invoke:auth:get-user", userId),
  } satisfies WindowAPI.Auth,

  // Users API (new colocated handlers)
  user: {
    listAvailableUsers: (params) =>
      ipcRenderer.invoke("invoke:user:list-available-users", params),
    list: (input) =>
      ipcRenderer.invoke("invoke:user:list", input),
    listHumans: (input) =>
      ipcRenderer.invoke("invoke:user:list-humans", input),
    listAgents: (input) =>
      ipcRenderer.invoke("invoke:user:list-agents", input),
    get: (input) =>
      ipcRenderer.invoke("invoke:user:get", input),
    getByType: (input) =>
      ipcRenderer.invoke("invoke:user:get-by-type", input),
    create: (input) =>
      ipcRenderer.invoke("invoke:user:create", input),
    update: (input) =>
      ipcRenderer.invoke("invoke:user:update", input),
    inactivate: (input) =>
      ipcRenderer.invoke("invoke:user:inactivate", input),
    activate: (userId) =>
      ipcRenderer.invoke("invoke:user:activate", userId),
    getStats: (userId) =>
      ipcRenderer.invoke("invoke:user:get-user-stats", userId),
  } satisfies WindowAPI.User,

  // Projects API (new colocated handlers)  
  project: {
    create: (input) =>
      ipcRenderer.invoke("invoke:project:create", input),
    get: (id) =>
      ipcRenderer.invoke("invoke:project:get", id),
    list: () => 
      ipcRenderer.invoke("invoke:project:list"),
    update: (input) =>
      ipcRenderer.invoke("invoke:project:update", input),
    archive: (id) =>
      ipcRenderer.invoke("invoke:project:archive", id),
  } satisfies WindowAPI.Project,

  // LLM Providers API (new colocated handlers)
  llmProvider: {
    create: (input) =>
      ipcRenderer.invoke("invoke:llm-provider:create", input),
    list: (filters) =>
      ipcRenderer.invoke("invoke:llm-provider:list", filters),
    get: (id) =>
      ipcRenderer.invoke("invoke:llm-provider:get", id),
    update: (input) =>
      ipcRenderer.invoke("invoke:llm-provider:update", input),
    inactivate: (id) =>
      ipcRenderer.invoke("invoke:llm-provider:inactivate", id),
    setDefault: (input) =>
      ipcRenderer.invoke("invoke:llm-provider:set-default", input),
    getDefault: () =>
      ipcRenderer.invoke("invoke:llm-provider:get-default"),
    getKey: (providerId) =>
      ipcRenderer.invoke("invoke:llm-provider:get-key", providerId),
  } satisfies WindowAPI.LlmProvider,

  // Agents API (new colocated handlers)
  agent: {
    create: (input) =>
      ipcRenderer.invoke("invoke:agent:create", input),
    list: (filters) =>
      ipcRenderer.invoke("invoke:agent:list", filters),
    get: (id) =>
      ipcRenderer.invoke("invoke:agent:get", id),
    getByProvider: (id) =>
      ipcRenderer.invoke("invoke:agent:get-by-provider", id),
    update: (input) =>
      ipcRenderer.invoke("invoke:agent:update", input),
    inactivate: (id) =>
      ipcRenderer.invoke("invoke:agent:inactivate", id),
    activate: (id) =>
      ipcRenderer.invoke("invoke:agent:activate", id),
    countActive: () =>
      ipcRenderer.invoke("invoke:agent:count-active"),
    listForConversation: () =>
      ipcRenderer.invoke("invoke:agent:list-for-conversation"),
  } satisfies WindowAPI.Agent,

  // DM Conversations API (new colocated handlers)
  dm: {
    create: (input) =>
      ipcRenderer.invoke("invoke:dm:create", input),
    list: (options) =>
      ipcRenderer.invoke("invoke:dm:list", options),
    get: (dmId) =>
      ipcRenderer.invoke("invoke:dm:get", dmId),
    archive: (input) =>
      ipcRenderer.invoke("invoke:dm:archive", input),
    unarchive: (channelId) =>
      ipcRenderer.invoke("invoke:dm:unarchive", channelId),
    sendMessage: (input) =>
      ipcRenderer.invoke("invoke:dm:send-message", input),
    listMessages: (input) =>
      ipcRenderer.invoke("invoke:dm:list-messages", input),
    addParticipant: (input) =>
      ipcRenderer.invoke("invoke:dm:add-participant", input),
    removeParticipant: (input) =>
      ipcRenderer.invoke("invoke:dm:remove-participant", input),
    inactivate: (input) =>
      ipcRenderer.invoke("invoke:dm:inactivate", input),
  } satisfies WindowAPI.Dm,

  // Project Channels API (new colocated handlers)
  channel: {
    create: (input) =>
      ipcRenderer.invoke("invoke:channel:create", input),
    list: (input) =>
      ipcRenderer.invoke("invoke:channel:list", input),
    get: (channelId) =>
      ipcRenderer.invoke("invoke:channel:get", channelId),
    update: (input) =>
      ipcRenderer.invoke("invoke:channel:update", input),
    archive: (input) =>
      ipcRenderer.invoke("invoke:channel:archive", input),
    unarchive: (channelId) =>
      ipcRenderer.invoke("invoke:channel:unarchive", channelId),
    sendMessage: (input) =>
      ipcRenderer.invoke("invoke:channel:send-message", input),
    listMessages: (input) =>
      ipcRenderer.invoke("invoke:channel:list-messages", input),
    inactivate: (input) =>
      ipcRenderer.invoke("invoke:channel:inactivate", input),
  } satisfies WindowAPI.Channel,

  // Profile API (new colocated handlers)
  profile: {
    getTheme: (userId) =>
      ipcRenderer.invoke("invoke:profile:get-theme", userId),
    update: (input) =>
      ipcRenderer.invoke("invoke:profile:update", input),
  } satisfies WindowAPI.Profile,

  // Window API (new colocated handlers)
  window: {
    minimize: () =>
      ipcRenderer.invoke("invoke:window:minimize"),
    maximize: () =>
      ipcRenderer.invoke("invoke:window:maximize"),
    toggle: () =>
      ipcRenderer.invoke("invoke:window:toggle-size"),
    close: () =>
      ipcRenderer.invoke("invoke:window:close"),
  } satisfies WindowAPI.Window,

  // Event system for reactive stores
  event: {
    register: (pattern: string) =>
      ipcRenderer.invoke("invoke:event:register", pattern),
  } satisfies WindowAPI.Event,

  // General invoke method
  invoke: (channel: string, ...args: unknown[]) =>
    ipcRenderer.invoke(channel, ...args),

  // Generic event listener for reactive stores
  on: (channel: string, callback: (...args: any[]) => void) => {
    const subscription = (_: any, ...args: any[]) => callback(...args);
    ipcRenderer.on(channel, subscription);
    return () => ipcRenderer.removeListener(channel, subscription);
  },
} satisfies WindowAPI.API);