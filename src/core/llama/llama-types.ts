import * as NodeLlama from "node-llama-cpp";
import { z } from "zod";

// ======================
// Tipos Básicos do LLAMA
// ======================
export type Llama = NodeLlama.Llama;
export type LlamaContext = NodeLlama.LlamaContext;
export type LlamaModel = NodeLlama.LlamaModel;
export type LlamaChatSession = NodeLlama.LlamaChatSession;

// ======================
// Tipos de Configuração
// ======================
export type LlamaOptions = NodeLlama.LlamaOptions;
export type LlamaModelOptions = NodeLlama.LlamaModelOptions;
export type LlamaChatSessionOptions = NodeLlama.LlamaChatSessionOptions;
export type LLamaChatPromptOptions = NodeLlama.LLamaChatPromptOptions;
export type LlamaGpuType = NodeLlama.LlamaGpuType;
export type ModelDownloaderOptions = NodeLlama.ModelDownloaderOptions;

export interface LlamaInitConfig {
  enableLogging?: boolean;
  gpu?: boolean;
  gpuType?: LlamaGpuType;
  numThreads?: number;
  maxContextSize?: number;
}

export interface LlamaModelConfig {
  modelPath: string;
  gpuLayers?: number;
  vocabOnly?: boolean;
  useMlock?: boolean;
  embedding?: boolean;
}

// ======================
// Parâmetros de Contexto
// ======================
export interface LlamaContextParams {
  seed?: number;
  contextSize?: number;
  batchSize?: number;
  threads?: number;
  f16Kv?: boolean;
  logitsAll?: boolean;
  vocabOnly?: boolean;
  useMlock?: boolean;
  embedding?: boolean;
}

// ======================
// Tipos de Completion
// ======================
export interface CompletionOptions {
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  stopSequences?: string[];
  streamResponse?: boolean;
}

export interface LlamaCompletionRequest {
  prompt: string;
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  stopSequences?: string[];
  stream?: boolean;
}

export interface CompletionChunk {
  content: string;
  tokensPerSecond?: number;
}

// ======================
// Tipos de Mensagens do Cliente para o Worker
// ======================
export interface InitMessage {
  type: "init";
  options?: LlamaOptions;
}

export interface LoadModelMessage {
  type: "load_model";
  modelPath: string;
  options?: LlamaModelOptions;
}

export interface CreateContextMessage {
  type: "create_context";
}

export interface TextCompletionMessage {
  type: "text_completion";
  prompt: string;
  options?: CompletionOptions;
  requestId: string;
}

export interface ChatCompletionMessage {
  type: "chat_completion";
  messages: Array<{
    role: "system" | "user" | "assistant";
    content: string;
  }>;
  options?: CompletionOptions;
  requestId: string;
}

export interface DownloadModelMessage {
  type: "download_model";
  modelUris: string[];
  requestId: string;
}

export interface AbortMessage {
  type: "abort";
}

export interface AbortDownloadMessage {
  type: "abort_download";
}

export type LlamaClientMessageType =
  | InitMessage
  | LoadModelMessage
  | CreateContextMessage
  | TextCompletionMessage
  | ChatCompletionMessage
  | DownloadModelMessage
  | AbortMessage
  | AbortDownloadMessage;

// ======================
// Tipos de Resposta do Worker
// ======================
export interface InfoResponse {
  type: "info";
  message: string;
}

export interface ErrorResponse<
  T extends LlamaAPIErrorCode = LlamaAPIErrorCode
> {
  type: "error";
  code: T;
  message: string;
  details?: T extends keyof ErrorContextMap ? ErrorContextMap[T] : never;
}

export interface ProgressResponse {
  type: "progress";
  operation: "download" | "load";
  progress: number;
  downloaded?: number;
  total?: number;
}

export interface ModelInfo {
  name: string;
  size: number;
  path: string;
}

export interface ModelLoadedResponse {
  type: "model_loaded";
  modelInfo: ModelInfo;
}

export interface CompletionChunkResponse {
  type: "completion_chunk";
  chunk: string;
  tokensPerSecond?: number;
}

export interface CompletionStats {
  totalTokens: number;
  evaluationTime: number;
  tokensPerSecond: number;
}

export interface CompletionData {
  fullText: string;
  stats: CompletionStats;
}

export interface DownloadProgress {
  operation: "download" | "load";
  progress: number;
  downloaded?: number;
  total?: number;
}

export interface ErrorData {
  code: LlamaAPIErrorCode;
  message: string;
  details?: unknown;
}

export interface CompletionDoneResponse {
  type: "completion_done";
  fullText: string;
  stats: CompletionStats;
}

export interface DownloadProgressResponse {
  type: "download_progress";
  requestId: string;
  progress: number;
  downloaded: number;
  total: number;
}

export interface DownloadCompleteResponse {
  type: "download_complete";
  requestId: string;
  filePath: string;
  modelInfo: ModelInfo;
}

export interface DownloadErrorResponse {
  type: "download_error";
  requestId: string;
  error: string;
  details?: unknown;
}

export type LlamaWorkerResponseType =
  | InfoResponse
  | ErrorResponse
  | ProgressResponse
  | ModelLoadedResponse
  | CompletionChunkResponse
  | CompletionDoneResponse
  | DownloadProgressResponse
  | DownloadCompleteResponse
  | DownloadErrorResponse;

// ======================
// Especificações de Download
// ======================
export interface LlamaModelDownloadSpec {
  modelUris: string[];
  destinationDir: string;
  filename?: string;
  verifyChecksum?: {
    algorithm: "sha256" | "md5";
    expectedHash: string;
  };
  retry?: {
    maxAttempts: number;
    delayMs: number;
  };
  onProgress?: (progress: number, downloaded: number, total: number) => void;
}

// ======================
// Tipos de Erro
// ======================
export enum LlamaAPIErrorCode {
  // Erros de inicialização
  EnvironmentConfigInvalid = "LLAMA_ENV_CFG_001",
  NativeDependencyMissing = "LLAMA_NATIVE_DEP_002",
  GpuAllocationFailed = "LLAMA_GPU_ALLOC_003",

  // Erros de modelo
  ModelLoadFailed = "LLAMA_MODEL_LOAD_004",
  ModelIncompatible = "LLAMA_MODEL_COMPAT_005",
  ModelValidationError = "LLAMA_MODEL_VALID_006",

  // Erros de contexto
  ContextConfigInvalid = "LLAMA_CTX_CFG_007",
  ContextAllocationFailed = "LLAMA_CTX_ALLOC_008",

  // Erros de execução
  CompletionTimeout = "LLAMA_COMPLETION_TIMEOUT_009",
  TokenizationFailed = "LLAMA_TOKENIZER_ERR_010",
  InferenceInterrupted = "LLAMA_INFERENCE_INT_011",

  // Erros de download
  DownloadValidationFailed = "LLAMA_DL_VALID_012",
  DownloadIntegrityError = "LLAMA_DL_INTEGRITY_013",
  DownloadNetworkError = "LLAMA_DL_NETWORK_014",
}

type ErrorContextMap = {
  [LlamaAPIErrorCode.EnvironmentConfigInvalid]: {
    invalidFields: Array<keyof LlamaInitConfig>;
    validationErrors: string[];
  };
  [LlamaAPIErrorCode.NativeDependencyMissing]: {
    dependencyName: string;
    installCommand: string;
  };
  [LlamaAPIErrorCode.GpuAllocationFailed]: {
    gpuType: LlamaGpuType;
    errorDetails: string;
  };
  [LlamaAPIErrorCode.ModelLoadFailed]: {
    modelPath: string;
    systemError: NodeJS.ErrnoException;
  };
  [LlamaAPIErrorCode.ModelIncompatible]: {
    modelVersion: string;
    requiredVersion: string;
  };
  [LlamaAPIErrorCode.ModelValidationError]: {
    validationErrors: string[];
  };
  [LlamaAPIErrorCode.ContextConfigInvalid]: {
    invalidParams: Array<keyof LlamaContextParams>;
  };
  [LlamaAPIErrorCode.ContextAllocationFailed]: {
    requestedSize: number;
    availableMemory: number;
  };
  [LlamaAPIErrorCode.CompletionTimeout]: {
    timeoutMs: number;
    tokensGenerated: number;
  };
  [LlamaAPIErrorCode.TokenizationFailed]: {
    inputText: string;
    errorPosition: number;
  };
  [LlamaAPIErrorCode.InferenceInterrupted]: {
    signal: string;
  };
  [LlamaAPIErrorCode.DownloadValidationFailed]: {
    validationRule: string;
  };
  [LlamaAPIErrorCode.DownloadIntegrityError]: {
    expectedHash: string;
    actualHash: string;
    algorithm: "sha256" | "md5";
  };
  [LlamaAPIErrorCode.DownloadNetworkError]: {
    statusCode: number;
    url: string;
  };
};

export interface LlamaAPIError extends Error {
  code: LlamaAPIErrorCode;
  details?: ErrorContextMap[LlamaAPIErrorCode];
  originalError?: Error;
}

export class LlamaAPIErrorInstance<
  T extends LlamaAPIErrorCode = LlamaAPIErrorCode
> extends Error {
  public readonly code: T;
  public readonly context?: T extends keyof ErrorContextMap
    ? ErrorContextMap[T]
    : never;

  constructor(params: {
    code: T;
    message: string;
    context?: T extends keyof ErrorContextMap ? ErrorContextMap[T] : never;
  }) {
    super(params.message);
    this.name = "LlamaAPIError";
    this.code = params.code;
    this.context = params.context;
  }

  toJSON() {
    return {
      code: this.code,
      message: this.message,
      ...(this.context && { context: this.context }),
    };
  }
}

// ======================
// Interface Principal da API
// ======================
export interface LlamaAPI {
  // Configuração e inicialização
  initializeLlamaEnvironment(config: LlamaInitConfig): void;
  prepareModelForInference(modelConfig: LlamaModelConfig): void;
  createInferenceContext(contextParams: LlamaContextParams): void;

  // Operações principais
  generateTextCompletion(
    promptRequest: LlamaCompletionRequest,
    handlers: {
      onChunk: (chunk: CompletionChunk) => void;
      onDone: (result: CompletionDoneResponse["stats"]) => void;
      onError: (error: LlamaAPIErrorInstance) => void;
    }
  ): void;

  generateChatCompletion(
    messages: ChatCompletionMessage["messages"],
    options: CompletionOptions,
    handlers: {
      onChunk: (chunk: CompletionChunk) => void;
      onDone: (result: CompletionDoneResponse["stats"]) => void;
      onError: (error: LlamaAPIErrorInstance) => void;
    }
  ): void;

  // Gerenciamento de modelos
  downloadModelSafely(
    downloadSpec: LlamaModelDownloadSpec,
    handlers: {
      onProgress: (progress: DownloadProgressResponse) => void;
      onComplete: (result: DownloadCompleteResponse) => void;
      onError: (error: LlamaAPIErrorInstance) => void;
    }
  ): void;

  // Controle de operações
  cancelOngoingOperation(operationType: LlamaOperationType): void;

  // Comunicação via MessageChannel
  setupMessageChannel(config: MessageChannelConfig): void;
  sendMessage<T = unknown>(message: MessagePayload<T>): void;
  onMessage<T = unknown>(
    handler: (message: MessagePayload<T>) => void
  ): () => void;
  getBufferState(): MessageBufferState;

  // Gerenciamento de ciclo de vida
  dispose(): void;
}

export type LlamaOperationType =
  | "initialize"
  | "load_model"
  | "create_context"
  | "text_completion"
  | "chat_completion"
  | "download_model"
  | "abort"
  | "abort_download";

// ======================
// Tipos para MessageChannel IPC
// ======================
export interface MessagePayload<T = unknown> {
  id: string;
  type: MessageType;
  channel: string;
  timestamp: number;
  data: T;
  metadata?: Record<string, unknown>;
  priority?: MessagePriority;
}

export enum MessageType {
  REQUEST = "request",
  RESPONSE = "response",
  EVENT = "event",
  HEARTBEAT = "heartbeat",
  ERROR = "error",
  TASK = "task",
  COMMAND = "command",
  STREAM = "stream",
}

export enum MessageSubtype {
  // Tipos de tarefa
  MODEL_LOAD = "model:load",
  INFERENCE_START = "inference:start",
  DATA_PROCESSING = "data:processing",

  // Tipos de comando
  CANCELLATION = "command:cancel",
  STATUS_UPDATE = "command:status",
  CONFIG_UPDATE = "command:config",

  // Tipos de stream
  TOKEN_STREAM = "stream:token",
  PROGRESS_STREAM = "stream:progress",
  METRIC_STREAM = "stream:metric",
}

export enum SerializationFormat {
  JSON = "json",
  PROTOBUF = "protobuf",
  MESSAGEPACK = "messagepack",
  BSON = "bson",
}

export enum IPCEventType {
  CONNECTION = "ipc:connection",
  DISCONNECT = "ipc:disconnect",
  MESSAGE_RECEIVED = "ipc:message:received",
  MESSAGE_SENT = "ipc:message:sent",
}

export interface ConnectionEventPayload {
  channel: string;
  endpoint: "main" | "renderer";
  connectionTime: number;
}

export interface MessageEventPayload<T = unknown> {
  messageId: string;
  channel: string;
  direction: "incoming" | "outgoing";
  payload: T;
}

export const MessageSchema = z.object({
  id: z.string().uuid(),
  type: z.nativeEnum(MessageType),
  channel: z.string().min(3).max(255),
  timestamp: z.number().int().positive(),
  data: z.unknown().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export interface MessageValidationResult {
  success: boolean;
  error?: z.ZodError;
  validatedData?: MessagePayload;
}

export interface MessageBufferConfig {
  maxCapacity: number;
  flushThreshold: number;
  retentionPeriod: number;
  prioritizationStrategy: "fifo" | "lifo" | "priority";
}

export interface MessageBufferState {
  currentSize: number;
  queuedMessages: number;
  droppedMessages: number;
  lastFlush: number;
  averageProcessingTime: number;
}

export enum MessagePriority {
  CRITICAL = 4,
  HIGH = 3,
  NORMAL = 2,
  LOW = 1,
}

export interface PrioritizedMessage<T = unknown> extends MessagePayload<T> {
  priority: MessagePriority;
  expiration?: number;
  retryCount?: number;
}

// ======================
// Configuração do Canal de Comunicação
// ======================
export interface MessageChannelConfig {
  name: string;
  bufferConfig: MessageBufferConfig;
  serialization: SerializationFormat;
  validation?: boolean;
  timeout?: number;
  security?: {
    encryption?: boolean;
    signing?: boolean;
    allowedOrigins?: string[];
  };
  qos?: {
    maxRetries: number;
    retryDelay: number;
    acknowledgementTimeout: number;
    priority: MessagePriority;
    deliveryGuarantee: "at-most-once" | "at-least-once" | "exactly-once";
  };
  securityPolicy?: {
    allowedOrigins: string[];
    maxMessageSize: number;
    encryptionRequired: boolean;
  };
  retryStrategy?: "linear" | "exponential" | "custom";
}

// ======================
// Tipos de Mensagens IPC
// ======================
export type IPCMessage<T = unknown> = MessagePayload<T> & {
  origin: "main" | "renderer";
  destination: "main" | "renderer" | "both";
  correlationId?: string;
  timestamp: number;
};

export enum IPCMessageType {
  TASK_INIT = "task:init",
  TASK_PROGRESS = "task:progress",
  TASK_COMPLETE = "task:complete",
  TASK_ERROR = "task:error",
  DATA_UPDATE = "data:update",
  MODEL_STATUS = "model:status",
  INFERENCE_RESULT = "inference:result",
}

export interface TaskPayload<T = unknown> {
  taskId: string;
  operation: LlamaOperationType;
  parameters: T;
  metadata?: {
    priority?: MessagePriority;
    expiration?: number;
    retryPolicy?: {
      maxAttempts: number;
      backoffFactor: number;
    };
  };
}

// ======================
// Tipos de Eventos
// ======================
export interface IPCConnectionEvent {
  type: IPCEventType.CONNECTION;
  channel: string;
  endpoint: "main" | "renderer";
  connectionState: "connected" | "disconnected";
  timestamp: number;
}

export interface IPCMessageEvent<T = unknown> {
  type: IPCEventType.MESSAGE_RECEIVED | IPCEventType.MESSAGE_SENT;
  messageId: string;
  direction: "incoming" | "outgoing";
  payload: T;
  channel: string;
  timestamp: number;
}

// ======================
// Schemas de Validação
// ======================
export const PrioritizedMessageSchema = MessageSchema.extend({
  priority: z.nativeEnum(MessagePriority),
  expiration: z.number().int().optional(),
  retryCount: z.number().int().default(0),
  origin: z.enum(["main", "renderer"]),
  destination: z.enum(["main", "renderer", "both", "worker"]),
});

export const ErrorPayloadSchema = z.object({
  code: z.nativeEnum(LlamaAPIErrorCode),
  message: z.string(),
  details: z.record(z.unknown()).optional(),
  stackTrace: z.string().optional(),
});

// ======================
// Buffer de Mensagens
// ======================
export interface MessageBufferConfig {
  maxCapacity: number;
  flushThreshold: number;
  retentionPeriod: number;
  prioritizationStrategy: "fifo" | "lifo" | "priority";
  overflowPolicy: "drop" | "block" | "error";
  batchProcessing: {
    enabled: boolean;
    maxBatchSize: number;
    timeout: number;
  };
}

export interface MessageBufferState {
  currentSize: number;
  queuedMessages: number;
  droppedMessages: number;
  lastFlush: number;
  averageProcessingTime: number;
  memoryUsage: {
    heapUsed: number;
    external: number;
  };
  channels: Record<
    string,
    {
      pending: number;
      inFlight: number;
    }
  >;
}

// ======================
// Sistema de Prioridades
// ======================
export interface PriorityScoring {
  basePriority: MessagePriority;
  weightFactors: {
    latencySensitivity: number;
    dataCriticality: number;
    dependencyLevel: number;
  };
  decayFunction?: (age: number) => number;
}

export enum PriorityThreshold {
  CRITICAL = 90,
  HIGH = 70,
  NORMAL = 50,
  LOW = 30,
}
