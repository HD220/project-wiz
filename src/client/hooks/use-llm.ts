import { useEffect, useState, useCallback } from "react";
import { useDebouncedCallback } from "use-debounce";
import type {
  DownloadProgress,
  ModelInfo,
  CompletionData,
  ErrorData,
} from "./llama-types";

export interface LLMState {
  download: number;
  load: number;
  isReady: boolean;
  error: string | null;
  isGenerating: boolean;
  completionOutput: string;
  modelInfo: ModelInfo | null;
}

export function useLLM() {
  // Estado principal do LLM
  const [state, setState] = useState<LLMState>({
    download: 0,
    load: 0,
    isReady: false,
    error: null,
    isGenerating: false,
    completionOutput: "",
    modelInfo: null,
  });
  // Novo estado para gerenciamento de download
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  // Callbacks para atualização de estado com debounce
  const setDownloadDebounced = useDebouncedCallback(
    (progress: number) => {
      setState((prev) => ({ ...prev, download: progress * 100.0 }));
    },
    100,
    { maxWait: 1000 }
  );

  const setLoadDebounced = useDebouncedCallback(
    (progress: number) => {
      setState((prev) => ({ ...prev, load: progress * 100.0 }));
    },
    100,
    { maxWait: 1000 }
  );

  // Ações do LLM
  const initLLM = useCallback(
    (options?: {
      debug?: boolean;
      gpu?: "auto" | "cuda" | "metal" | "vulkan" | "off";
      numThreads?: number;
    }) => {
      window.electronAPI.llm.init(options);
    },
    []
  );

  const loadModel = useCallback(
    (
      modelPath: string,
      options?: {
        gpuLayers?: number;
        contextSize?: number;
        batchSize?: number;
        seed?: number;
        ignoreMemorySafetyChecks?: boolean;
      }
    ) => {
      setState((prev) => ({ ...prev, load: 0, isReady: false }));
      window.electronAPI.llm.loadModel(modelPath, options);
    },
    []
  );

  const createContext = useCallback(() => {
    window.electronAPI.llm.createContext();
  }, []);

  const generateCompletion = useCallback(
    (
      prompt: string,
      options?: {
        maxTokens?: number;
        temperature?: number;
        topP?: number;
        stopSequences?: string[];
        streamResponse?: boolean;
      }
    ) => {
      setState((prev) => ({
        ...prev,
        isGenerating: true,
        completionOutput: "",
        error: null,
      }));
      window.electronAPI.llm.generateCompletion(prompt, options);
    },
    []
  );

  const generateChatCompletion = useCallback(
    (
      messages: Array<{
        role: "system" | "user" | "assistant";
        content: string;
      }>,
      options?: {
        maxTokens?: number;
        temperature?: number;
        topP?: number;
        stopSequences?: string[];
        streamResponse?: boolean;
      }
    ) => {
      setState((prev) => ({
        ...prev,
        isGenerating: true,
        completionOutput: "",
        error: null,
      }));
      window.electronAPI.llm.generateChatCompletion(messages, options);
    },
    []
  );

  const abort = useCallback(() => {
    window.electronAPI.llm.abort();
  }, []);

  // Configuração de event listeners
  useEffect(() => {
    // Configurar listeners para eventos do LLM
    const modelLoadedRemover = window.electronAPI.llm.onModelLoaded(
      (modelInfo: ModelInfo) => {
        setState((prev) => ({
          ...prev,
          isReady: true,
          modelInfo,
        }));
      }
    );

    const progressRemover = window.electronAPI.llm.onProgress(
      (data: DownloadProgress) => {
        if (data.operation === "download") {
          setDownloadDebounced(data.progress);
        } else if (data.operation === "load") {
          setLoadDebounced(data.progress);
        }
      }
    );

    const chunkRemover = window.electronAPI.llm.onCompletionChunk(
      (chunk: string) => {
        setState((prev) => ({
          ...prev,
          completionOutput: prev.completionOutput + chunk,
        }));
      }
    );

    const completionDoneRemover = window.electronAPI.llm.onCompletionDone(
      (data: CompletionData) => {
        setState((prev) => ({
          ...prev,
          isGenerating: false,
          completionOutput: data.fullText,
        }));
      }
    );

    const errorRemover = window.electronAPI.llm.onError((data: ErrorData) => {
      setState((prev) => ({
        ...prev,
        isGenerating: false,
        error: data.error,
      }));
    });

    // Remover todos os listeners ao desmontar o componente
    return () => {
      modelLoadedRemover();
      progressRemover();
      chunkRemover();
      completionDoneRemover();
      errorRemover();
    };
  }, [setDownloadDebounced, setLoadDebounced]);

  return {
    state,
    actions: {
      initLLM,
      loadModel,
      createContext,
      generateCompletion,
      generateChatCompletion,
      abort,
    },
  };
}
