import {
  LlamaWorkerMessageType,
  LlamaOptions,
  LlamaModelOptions,
  LlamaChatSessionOptions,
  LlamaMessageType,
  BaseCallback,
  InitCallbackData,
  ModelLoadCallbackData,
  PromptCompletionCallbackData,
  ModelDownloadCallbackData,
} from "./llama/llama-types";

export interface LlamaAPI {
  initializeLlamaEnvironment(
    message: LlamaMessageType<"init"> & {
      callbacks?: BaseCallback<
        InitCallbackData["progress"],
        InitCallbackData["result"],
        InitCallbackData["error"]
      >;
    }
  ): Promise<void>;

  prepareModelForInference(
    message: LlamaMessageType<"load_model"> & {
      callbacks?: BaseCallback<
        ModelLoadCallbackData["progress"],
        ModelLoadCallbackData["result"],
        ModelLoadCallbackData["error"]
      >;
    }
  ): Promise<void>;

  createInferenceContext(
    message: LlamaMessageType<"create_context"> & {
      callbacks?: BaseCallback;
    }
  ): Promise<void>;

  generateTextCompletion(
    message: LlamaMessageType<"prompt_completion"> & {
      callbacks?: BaseCallback<
        PromptCompletionCallbackData["progress"],
        PromptCompletionCallbackData["result"],
        PromptCompletionCallbackData["error"]
      >;
    }
  ): Promise<string>;

  downloadModelSafely(
    message: LlamaMessageType<"download_model"> & {
      callbacks?: BaseCallback<
        ModelDownloadCallbackData["progress"],
        ModelDownloadCallbackData["result"],
        ModelDownloadCallbackData["error"]
      >;
    }
  ): Promise<void>;

  cancelOngoingOperation(message: LlamaMessageType<"abort">): void;
}

declare global {
  interface Window {
    electronAPI: {
      llm: LlamaAPI;
    };
  }
}
