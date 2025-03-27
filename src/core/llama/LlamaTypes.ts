export type LlamaGpuType = "auto" | "cuda" | "metal" | "vulkan" | "off";

export interface LlamaInitOptions {
  debug?: boolean;
  gpu?: LlamaGpuType;
  maxThreads?: number;
}

export interface ModelLoadOptions {
  gpuLayers?: number;
  contextSize?: number;
  batchSize?: number;
  seed?: number;
}

export interface DownloadModelOptions {
  modelId: string;
  modelUrl?: string;
  outputPath?: string;
}

export type ProgressType = "load" | "download" | "inference";
export type MessageType =
  | "info"
  | "error"
  | "progress"
  | "completion"
  | "model_loaded";

export interface LlamaMessage {
  type: MessageType;
  message?: string;
  progressType?: ProgressType;
  progress?: number;
  error?: string;
  details?: any;
}
