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

export type LlamaMessageType<
  T extends LlamaWorkerMessageType["type"] = LlamaWorkerMessageType["type"]
> = Extract<LlamaWorkerMessageType, { type: T }>;

export interface BaseCallback<
  ProgressData = any,
  ResultData = any,
  ErrorData = any
> {
  onProgress?: (progress: ProgressData) => void;
  onDone?: (result: ResultData) => void;
  onError?: (error: ErrorData) => void;
}

export interface InitCallbackData {
  progress: { step: string; percentage: number };
  result: { initialized: boolean };
  error: Error;
}

export interface ModelLoadCallbackData {
  progress: { loadedBytes: number; totalBytes: number };
  result: { modelPath: string };
  error: Error;
}

export interface PromptCompletionCallbackData {
  progress: { processedTokens: number; totalTokens: number };
  result: { completion: string };
  error: Error;
}

export interface ModelDownloadCallbackData {
  progress: { downloadedBytes: number; totalBytes: number };
  result: { modelPath: string };
  error: Error;
}

export type LlamaWorkerMessageType =
  | {
      type: "init";
      options?: LlamaOptions;
      callbacks?: BaseCallback<
        InitCallbackData["progress"],
        InitCallbackData["result"],
        InitCallbackData["error"]
      >;
    }
  | {
      type: "load_model";
      options: LlamaModelOptions;
      callbacks?: BaseCallback<
        ModelLoadCallbackData["progress"],
        ModelLoadCallbackData["result"],
        ModelLoadCallbackData["error"]
      >;
    }
  | {
      type: "create_context";
      callbacks?: BaseCallback;
    }
  | {
      type: "prompt_completion";
      prompt: string;
      options?: Omit<LlamaChatSessionOptions, "contextSequence">;
      callbacks?: BaseCallback<
        PromptCompletionCallbackData["progress"],
        PromptCompletionCallbackData["result"],
        PromptCompletionCallbackData["error"]
      >;
    }
  | {
      type: "download_model";
      modelUris: string[];
      requestId: string;
      callbacks?: BaseCallback<
        ModelDownloadCallbackData["progress"],
        ModelDownloadCallbackData["result"],
        ModelDownloadCallbackData["error"]
      >;
    }
  | {
      type: "abort";
      operation: Exclude<LlamaMessageType["type"], "abort">;
      callbacks?: BaseCallback;
    };

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
