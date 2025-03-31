import { useCallback } from "react";
import {
  InitializeLlamaPayload,
  LoadModelPayload,
  CreateContextPayload,
  InitializeSessionPayload,
  ProcessRequestPayload,
} from "../../core/llm/types/ipc-config";

export const useLLM = () => {
  const { llama } = window.electronAPI;

  const initializeLlama = useCallback(
    (params: InitializeLlamaPayload) => llama.initialize(params),
    [llama]
  );

  const loadModel = useCallback(
    (params: LoadModelPayload) => llama.loadModel(params),
    [llama]
  );

  const createContext = useCallback(
    (params: CreateContextPayload) => llama.createContext(params),
    [llama]
  );

  const initializeSession = useCallback(
    (params: InitializeSessionPayload) => llama.initializeSession(params),
    [llama]
  );

  const processRequest = useCallback(
    (params: ProcessRequestPayload) => llama.processRequest(params),
    [llama]
  );

  return {
    initializeLlama,
    loadModel,
    createContext,
    initializeSession,
    processRequest,
  };
};
