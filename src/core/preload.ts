import { contextBridge, ipcRenderer } from "electron";
import {
  InitializeLlamaPayload,
  LoadModelPayload,
  CreateContextPayload,
  InitializeSessionPayload,
  ProcessRequestPayload,
  ProcessRequestResponse,
} from "./llm/types/ipc-config";

contextBridge.exposeInMainWorld("electronAPI", {
  llama: {
    initialize: async (params: InitializeLlamaPayload) => {
      try {
        return await ipcRenderer.invoke("llama:initialize", params);
      } catch (error) {
        throw new Error(
          `Failed to initialize Llama: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      }
    },
    loadModel: async (params: LoadModelPayload) => {
      try {
        return await ipcRenderer.invoke("llama:loadModel", params);
      } catch (error) {
        throw new Error(
          `Failed to load model: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      }
    },
    createContext: async (params: CreateContextPayload) => {
      try {
        return await ipcRenderer.invoke("llama:createContext", params);
      } catch (error) {
        throw new Error(
          `Failed to create context: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      }
    },
    initializeSession: async (params: InitializeSessionPayload) => {
      try {
        return await ipcRenderer.invoke("llama:initializeSession", params);
      } catch (error) {
        throw new Error(
          `Failed to initialize session: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      }
    },
    processRequest: async (params: ProcessRequestPayload) => {
      try {
        return await ipcRenderer.invoke("llama:processRequest", params);
      } catch (error) {
        throw new Error(
          `Failed to process request: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      }
    },
  },
});
