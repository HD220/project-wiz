export interface DownloadProgress {
  progress: number;
  modelId: string;
  operation: "download" | "load";
}

export interface ModelInfo {
  name: string;
  size: number;
  contextSize: number;
}

export interface CompletionData {
  fullText: string;
}

export interface ErrorData {
  error: string;
  details?: any;
}

export {};
