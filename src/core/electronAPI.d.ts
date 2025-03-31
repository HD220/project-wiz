import {
  InitializeLlamaPayload,
  LoadModelPayload,
  CreateContextPayload,
  InitializeSessionPayload,
  ProcessRequestPayload,
  ProcessRequestResponse,
} from "./llm/types/ipc-config";

declare global {
  interface Window {
    electronAPI: {
      llama: {
        initialize: (params: InitializeLlamaPayload) => Promise<void>;
        loadModel: (params: LoadModelPayload) => Promise<void>;
        createContext: (params: CreateContextPayload) => Promise<void>;
        initializeSession: (params: InitializeSessionPayload) => Promise<void>;
        processRequest: (
          params: ProcessRequestPayload
        ) => Promise<ProcessRequestResponse>;
      };
    };
  }
}
