// Tipos reutilizados do node-llama-cpp para LlamaWorker
export {
  Llama,
  LlamaContext,
  LlamaModel,
  LlamaChatSession,
  LLamaChatPromptOptions,
  LlamaModelOptions,
  LlamaChatSessionOptions,
  ChatHistoryItem,
  ModelDownloaderOptions,
} from "node-llama-cpp";

// Tipos adicionais específicos para o Worker, se necessário
export type LlamaWorkerMessageType =
  | "init"
  | "load_model"
  | "create_context"
  | "prompt_completion"
  | "download_model"
  | "abort"
  | "abort_download";
