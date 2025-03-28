import { MessagePortMain } from "electron";
import path from "path";
import {
  Llama,
  LlamaContext,
  LlamaModel,
  LlamaChatSession,
  LLamaChatPromptOptions,
  LlamaModelOptions,
  LlamaChatSessionOptions,
  LlamaWorkerMessageType,
  LlamaOptions,
} from "./llama-types";
import { fileURLToPath } from "url";

class LlamaWorker {
  private llamaInstance: Llama = null;
  private model: LlamaModel = null;
  private context: LlamaContext = null;
  private chatSession: LlamaChatSession = null;
  private port: MessagePortMain;
  private abortController: AbortController | null = null;
  private downloadAbortController: AbortController | null = null;

  constructor(port: MessagePortMain) {
    this.port = port;
    this.setupMessageHandlers();

    process.on("exit", () => this.cleanup());
    process.on("SIGINT", () => {
      this.cleanup();
      process.exit(0);
    });
  }

  private setupMessageHandlers() {
    this.port.on("message", async (event) => {
      const message = event.data as LlamaWorkerMessageType;
      try {
        await this.handleMessage(message);
      } catch (error: any) {
        this.sendError(error.message, error.stack);
      }
    });
  }

  private async handleMessage(message: LlamaWorkerMessageType) {
    switch (message.type) {
      case "init":
        await this.initialize(message.options);
        break;
      case "load_model":
        await this.loadModel(message.options);
        break;
      case "create_context":
        await this.createContext();
        break;
      case "prompt_completion":
        await this.generateText(message.prompt, message.options);
        break;
      case "download_model":
        await this.downloadModel(
          message.modelUris, //ajustar o tipo em llama-types.ts
          message.requestId
        );
        break;
      case "abort":
        this.abort();
        break;
      case "abort_download":
        this.abortDownload();
        break;
      default:
        this.sendError(
          `Tipo de mensagem desconhecido: ${JSON.stringify(message)}`
        );
    }
  }

  private async initialize(options?: LlamaOptions) {
    try {
      this.sendInfo("Inicializando node-llama-cpp...");
      const { getLlama } = await import("node-llama-cpp");
      this.llamaInstance = await getLlama(options);
      this.sendInfo("node-llama-cpp inicializado com sucesso");
    } catch (error: any) {
      this.sendError("Falha ao inicializar node-llama-cpp", error.message);
      throw error;
    }
  }

  private async loadModel(options: LlamaModelOptions) {
    if (!this.llamaInstance) {
      throw new Error("node-llama-cpp não inicializado");
    }

    try {
      this.sendInfo(`Carregando modelo: ${options.modelPath}`);
      this.model = await this.llamaInstance.loadModel(options);

      const modelInfo = {
        name: path.basename(options.modelPath),
        size: this.model.fileInsights.modelSize,
      };

      this.sendProgress("load", 1.0);
      this.sendModelLoaded(modelInfo);
      this.sendInfo("Modelo carregado com sucesso");
    } catch (error: any) {
      this.sendError("Erro ao carregar modelo", error.message);
      throw error;
    }
  }

  private async createContext() {
    if (!this.model) {
      throw new Error("Modelo não carregado");
    }

    try {
      this.sendInfo("Criando contexto...");
      this.context = await this.model.createContext();

      // Limpar a sessão de chat anterior, se existir
      if (this.chatSession) {
        this.chatSession = null;
      }

      this.sendInfo("Contexto criado com sucesso");
    } catch (error: any) {
      this.sendError("Erro ao criar contexto", error.message);
      throw error;
    }
  }

  private async ensureChatSession(
    options?: Omit<LlamaChatSessionOptions, "contextSequence">
  ) {
    if (!this.context) {
      throw new Error("Contexto não criado");
    }

    if (!this.chatSession) {
      this.chatSession = new LlamaChatSession({
        ...options,
        contextSequence: this.context.getSequence(),
      });
    }
  }

  private async generateText(
    input: string,
    options?: Omit<
      LlamaChatSessionOptions,
      "contextSequence" | "signal" | "onTextChunk"
    >
  ) {
    try {
      this.sendInfo("Gerando texto...");
      this.abortController = new AbortController();

      await this.ensureChatSession(options);

      const promptOptions: LLamaChatPromptOptions = {
        ...options,
        signal: this.abortController.signal,
        onTextChunk: (chunk: string) => {
          this.sendCompletionChunk(chunk);
        },
      };

      const { responseText, ...resposeData } =
        await this.chatSession.promptWithMeta(input, promptOptions);

      this.sendCompletionDone(responseText, resposeData);

      this.sendInfo("Geração de texto concluída");
    } catch (error: any) {
      if (error.name === "AbortError") {
        this.sendInfo("Geração abortada pelo usuário");
      } else {
        this.sendError("Erro ao gerar texto", error.message);
        throw error;
      }
    }
  }

  private async downloadModel(modelUris: string[], requestId: string) {
    try {
      const { createModelDownloader, combineModelDownloaders } = await import(
        "node-llama-cpp"
      );

      this.sendInfo(`Iniciando download do(s) modelo(s): ${modelUris}`);
      this.downloadAbortController = new AbortController();

      const modelsDir = path.join(
        path.dirname(fileURLToPath(import.meta.url)),
        "models"
      );

      const downloaders = modelUris.map(async (modelUri) => {
        return createModelDownloader({
          modelUri,
          dirPath: modelsDir,
          onProgress: ({ downloadedSize, totalSize }) => {
            this.sendDownloadProgress(requestId, downloadedSize / totalSize);
          },
        });
      });

      const combinedDownloader = await combineModelDownloaders(downloaders);

      const downloadedFiles = await combinedDownloader.download({
        signal: this.downloadAbortController.signal,
      });

      downloadedFiles.forEach((filePath) => {
        this.sendDownloadComplete(requestId, filePath);
      });

      this.sendInfo(
        `Modelo(s) baixado(s) com sucesso: ${downloadedFiles.join(", ")}`
      );
    } catch (error: any) {
      this.handleDownloadError(requestId, error);
    } finally {
      this.downloadAbortController = null;
    }
  }

  private handleDownloadError(requestId: string, error: Error) {
    if (error.name === "AbortError") {
      this.sendInfo("Download abortado pelo usuário");
    } else {
      this.sendDownloadError(requestId, error.message);

      if (error.message.includes("ENOSPC")) {
        this.sendError("Erro de download: Espaço em disco insuficiente");
      } else if (error.message.includes("ECONNRESET")) {
        this.sendError("Erro de download: Conexão interrompida");
      } else if (error.message.includes("Invalid URL")) {
        this.sendError("Erro de download: URL inválida");
      } else {
        this.sendError("Erro no download do modelo", error);
      }
    }
  }

  private abort() {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
      this.sendInfo("Operação abortada");
    }
  }

  private abortDownload() {
    if (this.downloadAbortController) {
      this.downloadAbortController.abort();
      this.downloadAbortController = null;
      this.sendInfo("Download abortado");
    }
  }

  public cleanup() {
    this.abort();
    this.abortDownload();

    if (this.chatSession) {
      this.chatSession = null;
    }

    if (this.context) {
      this.context.dispose();
      this.context = null;
    }

    if (this.model) {
      this.model.dispose();
      this.model = null;
    }

    this.sendInfo("Recursos liberados");
    this.port.close();
  }

  // Métodos para enviar respostas
  private sendInfo(message: string) {
    this.port.postMessage({ type: "info", message });
  }

  private sendError(error: string, details?: any) {
    this.port.postMessage({ type: "error", error, details });
  }

  private sendProgress(progressType: string, progress: number) {
    this.port.postMessage({
      type: "progress",
      operation: progressType,
      progress,
    });
  }

  private sendCompletionChunk(chunk: string) {
    this.port.postMessage({
      type: "completion_chunk",
      chunk,
    });
  }

  private sendCompletionDone(fullText: string, stats: any) {
    this.port.postMessage({
      type: "completion_done",
      fullText,
      stats,
    });
  }

  private sendModelLoaded(modelInfo: any) {
    this.port.postMessage({
      type: "model_loaded",
      modelInfo,
    });
  }

  private sendDownloadProgress(requestId: string, progress: number) {
    this.port.postMessage({
      type: "download_progress",
      requestId,
      progress,
    });
  }

  private sendDownloadComplete(requestId: string, filePath: string) {
    this.port.postMessage({
      type: "download_complete",
      requestId,
      filePath,
    });
  }

  private sendDownloadError(requestId: string, error: string) {
    this.port.postMessage({
      type: "download_error",
      requestId,
      error,
    });
  }
}

process.parentPort?.on("message", async (messageData) => {
  try {
    const [port] = messageData.ports;
    const worker = new LlamaWorker(port);
    port.start();
    port.postMessage("LlamaWorker inicializado e pronto para receber comandos");
  } catch (error) {
    console.error("LlamaWorker: Erro ao inicializar", error);
    process.exit(1);
  }
});
