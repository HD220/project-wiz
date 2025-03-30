import { useEffect, useState, useCallback, useRef } from "react";
import { useDebouncedCallback } from "use-debounce";
import type {
  ModelInfo,
  LlamaClientMessageType,
  LlamaWorkerResponseType,
  TextCompletionMessage,
  ChatCompletionMessage,
  DownloadModelMessage,
  CompletionData,
  CompletionStats,
  DownloadProgress,
  ErrorData,
} from "../../core/llama/llama-types";
import { LlamaAPIErrorCode } from "../../core/llama/llama-errors";

// Mapeamento de códigos de erro para mensagens amigáveis
const ERROR_MESSAGES: Record<LlamaAPIErrorCode, string> = {
  [LlamaAPIErrorCode.InitializationFailed]: "Falha na inicialização do modelo",
  [LlamaAPIErrorCode.ModelLoadError]: "Erro ao carregar o modelo",
  [LlamaAPIErrorCode.ContextCreationError]: "Erro ao criar contexto",
  [LlamaAPIErrorCode.DownloadFailed]: "Falha no download do modelo",
  [LlamaAPIErrorCode.CompletionError]: "Erro durante a geração de texto",
  [LlamaAPIErrorCode.InvalidRequest]: "Requisição inválida",
  [LlamaAPIErrorCode.Aborted]: "Operação cancelada",
};

// Tempo máximo de espera por respostas do worker (em ms)
const WORKER_TIMEOUT = 30000;

export interface LLMState {
  download: number;
  load: number;
  isReady: boolean;
  error: {
    message: string;
    code?: LlamaAPIErrorCode;
    details?: Record<string, unknown>;
  } | null;
  isGenerating: boolean;
  completionOutput: string;
  modelInfo: ModelInfo | null;
  stats?: CompletionStats;
  workerStatus: "initializing" | "ready" | "error";
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
    workerStatus: "initializing",
  });

  // Estado para a porta de comunicação com o worker
  const [llmPort, setLlmPort] = useState<MessagePort | null>(null);
  const [isPortReady, setIsPortReady] = useState(false);

  // Estados para gerenciamento de download
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  // Referência para armazenar callbacks de download
  const downloadCallbacksRef = useRef<Map<string, (progress: number) => void>>(
    new Map()
  );
  const downloadPromisesRef = useRef<
    Map<
      string,
      {
        resolve: (filePath: string) => void;
        reject: (error: Error) => void;
      }
    >
  >(new Map());

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

  // Inicialização da porta de comunicação
  useEffect(() => {
    // Solicitar porta de comunicação ao processo principal
    window.electronAPI.requestLlamaPort();

    // Quando a porta estiver disponível, atualizar estados
    const portReadyHandler = () => {
      setIsPortReady(true);
      setState((prev) => ({ ...prev, workerStatus: "ready" }));
    };
    window.addEventListener("llama-port-ready", portReadyHandler);

    // Configurar handlers para eventos do worker
    const removeHandlers = window.electronAPI.setupLlamaHandlers({
      onModelLoaded: (modelInfo: ModelInfo) => {
        setState((prev) => ({
          ...prev,
          isReady: true,
          modelInfo,
        }));
      },
      onProgress: (data: DownloadProgress) => {
        if (data.operation === "download") {
          setDownloadDebounced(data.progress);
        } else if (data.operation === "load") {
          setLoadDebounced(data.progress);
        }
      },
      onCompletionChunk: (chunk: string) => {
        setState((prev) => ({
          ...prev,
          completionOutput: prev.completionOutput + chunk,
        }));
      },
      onCompletionDone: (data: CompletionData) => {
        setState((prev) => ({
          ...prev,
          isGenerating: false,
          completionOutput: data.fullText,
          stats: data.stats, // Adiciona as métricas de desempenho ao estado
        }));
      },
      onError: (error: string | { code: LlamaAPIErrorCode }) => {
        const errorObj = {
          message:
            typeof error === "string"
              ? error
              : ERROR_MESSAGES[error.code] || `Erro: ${error.code}`,
          code: typeof error === "string" ? undefined : error.code,
        };

        const isAborted =
          typeof error !== "string" && error.code === LlamaAPIErrorCode.Aborted;

        setState((prev) => ({
          ...prev,
          isGenerating: false,
          error: isAborted
            ? {
                message: ERROR_MESSAGES[LlamaAPIErrorCode.Aborted],
                code: LlamaAPIErrorCode.Aborted,
              }
            : errorObj,
          workerStatus: isAborted ? "ready" : "error",
        }));
      },
      onDownloadProgress: (requestId: string, progress: number) => {
        // Atualizar progresso para o callback específico
        const callback = downloadCallbacksRef.current.get(requestId);
        if (callback) {
          callback(progress);
        }
        setDownloadProgress(progress);
      },
      onDownloadComplete: (requestId: string, filePath: string) => {
        // Resolver a promise de download
        const promiseHandlers = downloadPromisesRef.current.get(requestId);
        if (promiseHandlers) {
          promiseHandlers.resolve(filePath);
          downloadPromisesRef.current.delete(requestId);
          downloadCallbacksRef.current.delete(requestId);
        }

        setIsDownloading(false);
        setState((prev) => ({
          ...prev,
          download: 100,
        }));
      },
      onDownloadError: (requestId: string, error: string) => {
        // Rejeitar a promise de download
        const promiseHandlers = downloadPromisesRef.current.get(requestId);
        if (promiseHandlers) {
          promiseHandlers.reject(new Error(error));
          downloadPromisesRef.current.delete(requestId);
          downloadCallbacksRef.current.delete(requestId);
        }

        setIsDownloading(false);
        setDownloadError(error);
      },
    });

    // Limpar handlers ao desmontar
    return () => {
      if (removeHandlers) removeHandlers();
      window.removeEventListener("llama-port-ready", portReadyHandler);
    };
  }, [setDownloadDebounced, setLoadDebounced]);

  // Função para enviar mensagem ao worker com timeout
  const sendToWorker = useCallback(
    (message: LlamaClientMessageType) => {
      if (!isPortReady) {
        throw new Error("Porta de comunicação com o worker não está pronta");
      }

      return new Promise<void>((resolve, reject) => {
        // Configurar timeout
        const timeoutId = setTimeout(() => {
          reject(new Error("Timeout na comunicação com o worker"));
        }, WORKER_TIMEOUT);

        // Enviar mensagem e esperar resposta
        window.electronAPI.sendToLlamaWorker(message);

        // Para mensagens que esperam resposta, precisamos ouvir o evento correspondente
        // Resolver quando a operação for concluída (isso será tratado nos handlers específicos)
        resolve();

        // Limpar timeout se a operação for concluída antes
        clearTimeout(timeoutId);
      });
    },
    [isPortReady]
  );

  // Ações do LLM
  const initLLM = useCallback(
    (options?: {
      debug?: boolean;
      gpu?: "auto" | "cuda" | "metal" | "vulkan" | "off";
      numThreads?: number;
    }) => {
      // Converter opções para o formato esperado pelo worker
      const workerOptions = {
        ...options,
        // Tratar o caso especial de "off" para GPU
        gpu: options?.gpu === "off" ? undefined : options?.gpu,
      };

      sendToWorker({
        type: "init",
        options: workerOptions,
      });
    },
    [sendToWorker]
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

      sendToWorker({
        type: "load_model",
        modelPath,
        options: {
          ...options,
          modelPath, // Mantido para compatibilidade com tipo LlamaModelOptions
        },
      });
    },
    [sendToWorker]
  );

  const createContext = useCallback(() => {
    sendToWorker({ type: "create_context" });
  }, [sendToWorker]);

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

      const requestId = `text-completion-${Date.now()}`;
      sendToWorker({
        type: "text_completion",
        prompt,
        options,
        requestId,
      });
    },
    [sendToWorker]
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

      const requestId = `chat-completion-${Date.now()}`;
      sendToWorker({
        type: "chat_completion",
        messages,
        options,
        requestId,
      });
    },
    [sendToWorker]
  );

  const abort = useCallback(() => {
    sendToWorker({ type: "abort" });
    setState((prev) => ({
      ...prev,
      isGenerating: false,
      error: {
        message: ERROR_MESSAGES[LlamaAPIErrorCode.Aborted],
        code: LlamaAPIErrorCode.Aborted,
      },
    }));
  }, [sendToWorker]);

  // Função para iniciar o download de um modelo
  const startDownload = useCallback(
    (modelId: string) => {
      setIsDownloading(true);
      setDownloadProgress(0);
      setDownloadError(null);

      return new Promise<string>((resolve, reject) => {
        // Gerar ID único para este download
        const requestId = `download-${Date.now()}`;

        // Armazenar callbacks e promise handlers
        downloadCallbacksRef.current.set(requestId, (progress: number) => {
          setDownloadProgress(progress);
        });

        downloadPromisesRef.current.set(requestId, { resolve, reject });

        // Enviar mensagem de download
        sendToWorker({
          type: "download_model",
          modelUris: [modelId],
          requestId,
        });
      });
    },
    [sendToWorker]
  );

  // Função para cancelar o download em andamento
  const cancelDownload = useCallback(() => {
    sendToWorker({ type: "abort_download" });
    setIsDownloading(false);
    setDownloadProgress(0);
    setDownloadError(ERROR_MESSAGES[LlamaAPIErrorCode.Aborted]);

    // Rejeitar todas as promises pendentes
    downloadPromisesRef.current.forEach(({ reject }) => {
      reject(new Error(ERROR_MESSAGES[LlamaAPIErrorCode.Aborted]));
    });

    // Limpar maps
    downloadPromisesRef.current.clear();
    downloadCallbacksRef.current.clear();

    // Atualizar estado principal
    setState((prev) => ({
      ...prev,
      download: 0,
      error: {
        message: ERROR_MESSAGES[LlamaAPIErrorCode.Aborted],
        code: LlamaAPIErrorCode.Aborted,
      },
    }));
  }, [sendToWorker]);

  return {
    state: {
      ...state,
      downloadProgress,
      isDownloading,
      downloadError,
      isPortReady,
      stats: state.stats, // Expor as métricas de desempenho
    },
    actions: {
      initLLM,
      loadModel,
      createContext,
      generateCompletion,
      generateChatCompletion,
      abort,
      startDownload,
      cancelDownload,
    },
  };
}
