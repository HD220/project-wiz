import { MessagePortMain } from "electron";
import path from "path";
import fs from "fs";
import https from "https";
import {
  Llama,
  LlamaContext,
  LlamaModel,
  LlamaChatSession,
  LLamaChatPromptOptions,
  createModelDownloader,
  combineModelDownloaders,
  LlamaModelOptions,
  LlamaChatSessionOptions,
} from "node-llama-cpp";
import { fileURLToPath } from "url";

/**
 * LlamaWorker - Interface com node-llama-cpp usando MessagePort
 *
 * Implementação refatorada para usar exclusivamente o LlamaChatSession
 * para todas as interações de geração de texto.
 *
 * Esta implementação suporta:
 * - Geração de texto a partir de prompt simples
 * - Geração de texto a partir de mensagens de chat
 * - Streaming de resposta
 * - Todas as opções nativas do LlamaChatSession
 *
 * Esta classe implementa uma interface simplificada para o node-llama-cpp
 * que se comunica com o processo principal do Electron via MessagePort.
 */
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
      const message = event.data;
      try {
        await this.handleMessage(message);
      } catch (error: any) {
        this.sendError(error.message, error.stack);
      }
    });
  }

  private async handleMessage(message: any) {
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
          message.modelId || message.modelIds,
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
        this.sendError(`Tipo de mensagem desconhecido: ${message.type}`);
    }
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

  private async initialize(options?: any) {
    try {
      this.sendInfo("Inicializando node-llama-cpp...");
      const { getLlama } = await import("node-llama-cpp");
      this.llamaInstance = await getLlama({
        debug: options?.debug || false,
        gpu: options?.gpu || "auto",
        maxThreads: options?.numThreads,
      });
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

  /**
   * Implementa o download de um arquivo com progresso
   * @param url URL do arquivo
   * @param filePath Caminho onde o arquivo será salvo
   * @param onProgress Callback para reportar progresso
   */
  private async downloadFile(
    url: string,
    filePath: string,
    onProgress: (progress: number) => void
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const fileStream = fs.createWriteStream(filePath);
      let downloadedBytes = 0;
      let totalBytes = 0;

      https
        .get(url, (response) => {
          if (response.statusCode !== 200) {
            reject(
              new Error(
                `Falha ao baixar arquivo: ${response.statusCode} ${response.statusMessage}`
              )
            );
            return;
          }

          totalBytes = parseInt(response.headers["content-length"] || "0", 10);

          response.on("data", (chunk) => {
            downloadedBytes += chunk.length;
            if (totalBytes > 0) {
              const progress = downloadedBytes / totalBytes;
              onProgress(progress);
            }
          });

          response.pipe(fileStream);

          fileStream.on("finish", () => {
            fileStream.close();
            resolve();
          });

          fileStream.on("error", (err) => {
            fs.unlink(filePath, () => {});
            reject(err);
          });

          // Verificar se o download foi abortado
          if (this.downloadAbortController) {
            this.downloadAbortController.signal.addEventListener(
              "abort",
              () => {
                response.destroy();
                fileStream.close();
                fs.unlink(filePath, () => {});
                reject(new Error("Download abortado"));
              }
            );
          }
        })
        .on("error", (err) => {
          fs.unlink(filePath, () => {});
          reject(err);
        });
    });
  }

  /**
   * Baixa um ou mais modelos usando createModelDownloader
   * @param modelIds ID(s) do modelo (hf://org/repo ou URL)
   * @param requestId ID da requisição para rastreamento
   */
  private async downloadModel(modelUri: string | string[], requestId: string) {
    try {
      this.sendInfo(`Iniciando download do(s) modelo(s): ${modelUri}`);
      this.downloadAbortController = new AbortController();

      const modelsDir = path.join(
        path.dirname(fileURLToPath(import.meta.url)),
        "models"
      );

      const modelList = Array.isArray(modelUri) ? modelUri : [modelUri];

      const downloaders = modelList.map(async (modelUri) => {
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
