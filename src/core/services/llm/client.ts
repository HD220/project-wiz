import { IPCManager } from "./ipc";
import {
  InitializeLlamaPayload,
  LoadModelPayload,
  CreateContextPayload,
  InitializeSessionPayload,
  ProcessRequestPayload,
  ProcessRequestResponse,
} from "./types/ipc-config";

export class LLMClient {
  private ipcManager: IPCManager;

  constructor(ipcManager: IPCManager) {
    this.ipcManager = ipcManager;
  }

  async initializeLlama(params: InitializeLlamaPayload): Promise<void> {
    try {
      await this.ipcManager.requestResponse("initializeLlama", params);
    } catch (error) {
      throw new Error(
        `Failed to initialize Llama: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  async loadModel(params: LoadModelPayload): Promise<void> {
    try {
      await this.ipcManager.requestResponse("loadModel", params);
    } catch (error) {
      throw new Error(
        `Failed to load model: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  async createContext(params: CreateContextPayload): Promise<void> {
    try {
      await this.ipcManager.requestResponse("createContext", params);
    } catch (error) {
      throw new Error(
        `Failed to create context: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  async initializeSession(params: InitializeSessionPayload): Promise<void> {
    try {
      await this.ipcManager.requestResponse("initializeSession", params);
    } catch (error) {
      throw new Error(
        `Failed to initialize session: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  async prompt(params: ProcessRequestPayload): Promise<ProcessRequestResponse> {
    try {
      return await this.ipcManager.requestResponse("processRequest", params);
    } catch (error) {
      throw new Error(
        `Failed to process request: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }
}
