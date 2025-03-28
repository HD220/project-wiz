// Tipos reutilizados do node-llama-cpp para LlamaWorker
import {
  Llama,
  LlamaOptions,
  LlamaContext,
  LlamaModel,
  LlamaModelOptions,
  LlamaChatSession,
  LlamaChatSessionOptions,
  LLamaChatPromptOptions,
  ModelDownloaderOptions,
} from "node-llama-cpp";

// Tipos adicionais específicos para o Worker, se necessário
export type LlamaWorkerMessageType =
  | { type: "init"; options?: LlamaOptions }
  | { type: "load_model"; options: LlamaModelOptions }
  | { type: "create_context" }
  | {
      type: "prompt_completion";
      prompt: string;
      options?: Omit<LlamaChatSessionOptions, "contextSequence">;
    }
  | { type: "download_model"; modelUris: string[]; requestId: string }
  | { type: "abort" }
  | { type: "abort_download" };

// Re-exportar tipos para uso em outros módulos
export {
  Llama,
  LlamaOptions,
  LlamaContext,
  LlamaModel,
  LlamaModelOptions,
  LlamaChatSession,
  LlamaChatSessionOptions,
  LLamaChatPromptOptions,
  ModelDownloaderOptions,
};
