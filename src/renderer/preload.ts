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
    login: (credentials) =>
      ipcRenderer.invoke("invoke:auth:login", credentials),
    logout: () => ipcRenderer.invoke("invoke:auth:logout"),
    getActiveSession: () => ipcRenderer.invoke("invoke:auth:get-session"),
  } satisfies WindowAPI.Auth,

  // Users API (new colocated handlers)
  user: {
    list: (input) => ipcRenderer.invoke("invoke:user:list", input),
    get: (input) => ipcRenderer.invoke("invoke:user:get", input),
    getByType: (input) => ipcRenderer.invoke("invoke:user:get-by-type", input),
    create: (input) => ipcRenderer.invoke("invoke:user:create", input),
    update: (input) => ipcRenderer.invoke("invoke:user:update", input),
    inactivate: (userId) =>
      ipcRenderer.invoke("invoke:user:inactivate", { userId }),
    activate: (userId) =>
      ipcRenderer.invoke("invoke:user:activate", { userId }),
  } satisfies WindowAPI.User,

  // Projects API (new colocated handlers)
  project: {
    create: (input) => ipcRenderer.invoke("invoke:project:create", input),
    get: (id) => ipcRenderer.invoke("invoke:project:get", { projectId: id }),
    list: () => ipcRenderer.invoke("invoke:project:list"),
    update: (input) => ipcRenderer.invoke("invoke:project:update", input),
    archive: (id) =>
      ipcRenderer.invoke("invoke:project:archive", { projectId: id }),
    unarchive: (id) =>
      ipcRenderer.invoke("invoke:project:unarchive", { projectId: id }),
  } satisfies WindowAPI.Project,

  // LLM Providers API (new colocated handlers)
  llmProvider: {
    create: (input) => ipcRenderer.invoke("invoke:llm-provider:create", input),
    list: (filters) => ipcRenderer.invoke("invoke:llm-provider:list", filters),
    get: (id) =>
      ipcRenderer.invoke("invoke:llm-provider:get", { providerId: id }),
    update: (input) => ipcRenderer.invoke("invoke:llm-provider:update", input),
    inactivate: (id) =>
      ipcRenderer.invoke("invoke:llm-provider:inactivate", { id }),
    activate: (input) => ipcRenderer.invoke("invoke:provider:activate", input),
    setDefault: (input) =>
      ipcRenderer.invoke("invoke:llm-provider:set-default", input),
    getDefault: () => ipcRenderer.invoke("invoke:llm-provider:get-default"),
    getKey: (providerId) =>
      ipcRenderer.invoke("invoke:llm-provider:get-key", { providerId }),
  } satisfies WindowAPI.LlmProvider,

  // Agents API (new colocated handlers)
  agent: {
    create: (input) => ipcRenderer.invoke("invoke:agent:create", input),
    list: (filters) => ipcRenderer.invoke("invoke:agent:list", filters),
    get: (id) => ipcRenderer.invoke("invoke:agent:get", { agentId: id }),
    update: (input) => ipcRenderer.invoke("invoke:agent:update", input),
    inactivate: (input) => ipcRenderer.invoke("invoke:agent:inactivate", input),
    activate: (input) => ipcRenderer.invoke("invoke:agent:activate", input),
  } satisfies WindowAPI.Agent,

  // DM Conversations API (new colocated handlers)
  dm: {
    create: (input) => ipcRenderer.invoke("invoke:dm:create", input),
    list: (options) => ipcRenderer.invoke("invoke:dm:list", options),
    get: (input) => ipcRenderer.invoke("invoke:dm:get", input),
    archive: (input) => ipcRenderer.invoke("invoke:dm:archive", input),
    unarchive: (input) => ipcRenderer.invoke("invoke:dm:unarchive", input),
    addParticipant: (input) =>
      ipcRenderer.invoke("invoke:dm:add-participant", input),
    removeParticipant: (input) =>
      ipcRenderer.invoke("invoke:dm:remove-participant", input),
  } satisfies WindowAPI.Dm,

  // Conversation API (new handlers)
  conversation: {
    get: (input) => ipcRenderer.invoke("invoke:conversation:get", input),
    sendMessage: (input) =>
      ipcRenderer.invoke("invoke:conversation:send-message", input),
  } satisfies WindowAPI.Conversation,

  // Project Channels API (new colocated handlers)
  channel: {
    create: (input) => ipcRenderer.invoke("invoke:channel:create", input),
    list: (input) => ipcRenderer.invoke("invoke:channel:list", input),
    get: (channelId) => ipcRenderer.invoke("invoke:channel:get", { channelId }),
    update: (input) => ipcRenderer.invoke("invoke:channel:update", input),
    archive: (input) => ipcRenderer.invoke("invoke:channel:archive", input),
    unarchive: (channelId) =>
      ipcRenderer.invoke("invoke:channel:unarchive", { channelId }),
  } satisfies WindowAPI.Channel,

  // Profile API (new colocated handlers)
  profile: {
    getTheme: () => ipcRenderer.invoke("invoke:profile:get-theme"),
    update: (input) => ipcRenderer.invoke("invoke:profile:update", input),
  } satisfies WindowAPI.Profile,

  // Window API (new colocated handlers)
  window: {
    minimize: () => ipcRenderer.invoke("invoke:window:minimize"),
    maximize: () => ipcRenderer.invoke("invoke:window:maximize"),
    toggle: () => ipcRenderer.invoke("invoke:window:toggle-size"),
    close: () => ipcRenderer.invoke("invoke:window:close"),
  } satisfies WindowAPI.Window,
} satisfies WindowAPI.API);

// Track event callbacks for proper cleanup
const eventCallbacks = new Map<string, Map<unknown, unknown>>();

// Expose reactive events bridge for useReactiveQuery hook
contextBridge.exposeInMainWorld("events", {
  /**
   * Register an event listener for reactive events
   *
   * @param eventName - The event name to listen for (e.g., "event:messages")
   * @param callback - Callback function to handle the event data
   */
  on: <T = unknown>(eventName: string, callback: (data: T) => void) => {
    const wrappedCallback = (_event: Electron.IpcRendererEvent, data: T) => {
      callback(data);
    };

    // Track the callback mapping for proper cleanup
    if (!eventCallbacks.has(eventName)) {
      eventCallbacks.set(eventName, new Map());
    }
    eventCallbacks.get(eventName)!.set(callback, wrappedCallback);

    ipcRenderer.on(eventName, wrappedCallback);

    // Return cleanup function
    return () => {
      const callbackMap = eventCallbacks.get(eventName);
      if (callbackMap?.has(callback)) {
        const wrappedCb = callbackMap.get(callback);
        if (wrappedCb) {
          ipcRenderer.removeListener(
            eventName,
            wrappedCb as Parameters<typeof ipcRenderer.removeListener>[1],
          );
          callbackMap.delete(callback);
        }
      }
    };
  },

  /**
   * Remove an event listener for reactive events
   *
   * @param eventName - The event name to stop listening for
   * @param callback - The callback function to remove
   */
  off: <T = unknown>(eventName: string, callback: (data: T) => void) => {
    const callbackMap = eventCallbacks.get(eventName);
    if (callbackMap?.has(callback)) {
      const wrappedCallback = callbackMap.get(callback);
      if (wrappedCallback) {
        ipcRenderer.removeListener(
          eventName,
          wrappedCallback as Parameters<typeof ipcRenderer.removeListener>[1],
        );
        callbackMap.delete(callback);
      }
    }
  },

  /**
   * Register a one-time event listener
   *
   * @param eventName - The event name to listen for
   * @param callback - Callback function to handle the event data
   */
  once: <T = unknown>(eventName: string, callback: (data: T) => void) => {
    const wrappedCallback = (_event: Electron.IpcRendererEvent, data: T) => {
      callback(data);
    };

    ipcRenderer.once(eventName, wrappedCallback);
  },
});
