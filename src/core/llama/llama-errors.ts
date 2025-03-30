export enum LlamaAPIErrorCode {
  InitializationFailed = "LLAMA_INIT_001",
  ModelLoadError = "LLAMA_LOAD_002",
  ContextCreationError = "LLAMA_CONTEXT_003",
  DownloadFailed = "LLAMA_DOWNLOAD_004",
  CompletionError = "LLAMA_COMPLETION_005",
  InvalidRequest = "LLAMA_INVALID_006",
  Aborted = "LLAMA_ABORTED_007",
}

export interface LlamaAPIError extends Error {
  code: LlamaAPIErrorCode;
  context?: Record<string, unknown>;
}
