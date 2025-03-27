import { MessagePortMain } from "electron";
import path from "path";
import fs from "fs";
import https from "https";
import { Readable } from "stream";
import { parentPort } from "worker_threads";

/**
 * LlamaWorker - Interface com node-llama-cpp usando MessagePort
 *
 * Esta classe implementa uma interface simplificada para o node-llama-cpp
 * que se comunica com o processo principal do Electron via MessagePort.
 */
class LlamaWorker {
  private llamaInstance: any = null;
  private model: any = null;
  private context: any = null;
  private port: MessagePortMain;
  private abortController: AbortController | null = null;
  private downloadAbortController: AbortController | null = null;

  constructor(port: MessagePortMain) {
    this.port = port;
    this.setupMessageHandlers();

    // Configurar limpeza ao encerrar
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
        await this.loadModel(message.modelPath, message.options);
        break;
      case "create_context":
        await this.createContext();
        break;
      case "generate_completion":
        await this.generateCompletion(message.prompt, message.options);
        break;
      case "generate_chat_completion":
        await this.generateChatCompletion(message.messages, message.options);
        break;
      case "download_model":
        await this.downloadModel(message.modelId, message.requestId);
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

  /**
   * Inicializa a biblioteca node-llama-cpp
   * @param options Opções de inicialização
   */
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

  /**
   * Carrega um modelo do disco
   * @param modelPath Caminho para o arquivo do modelo
   * @param options Opções de carregamento
   */
  private async loadModel(modelPath: string, options?: any) {
    if (!this.llamaInstance) {
      throw new Error("node-llama-cpp não inicializado");
    }

    try {
      this.sendInfo(`Carregando modelo: ${modelPath}`);
      this.model = await this.llamaInstance.loadModel({
        modelPath,
        gpuLayers: options?.gpuLayers,
        contextSize: options?.contextSize,
        batchSize: options?.batchSize,
        seed: options?.seed,
        onLoadProgress: (progress: number) => {
          this.sendProgress("load", progress);
        },
      });

      const modelInfo = {
        name: path.basename(modelPath),
        size: fs.statSync(modelPath).size,
        parameters: this.model.params?.nParams || "Desconhecido",
      };

      this.sendProgress("load", 1.0);
      this.sendModelLoaded(modelInfo);
      this.sendInfo("Modelo carregado com sucesso");
    } catch (error: any) {
      this.sendError("Erro ao carregar modelo", error.message);
      throw error;
    }
  }

  /**
   * Cria um contexto para geração de texto
   */
  private async createContext() {
    if (!this.model) {
      throw new Error("Modelo não carregado");
    }

    try {
      this.sendInfo("Criando contexto...");
      this.context = await this.model.createContext();
      this.sendInfo("Contexto criado com sucesso");
    } catch (error: any) {
      this.sendError("Erro ao criar contexto", error.message);
      throw error;
    }
  }

  /**
   * Gera texto a partir de um prompt
   * @param prompt Texto de entrada
   * @param options Opções de geração
   */
  private async generateCompletion(prompt: string, options?: any) {
    if (!this.context) {
      throw new Error("Contexto não criado");
    }

    try {
      this.sendInfo("Gerando completion...");
      this.abortController = new AbortController();

      let fullText = "";

      await this.context.completion({
        prompt,
        maxTokens: options?.maxTokens || 512,
        temperature: options?.temperature || 0.8,
        topP: options?.topP || 0.95,
        stopSequences: options?.stopSequences || [],
        stream: true,
        signal: this.abortController.signal,
        onToken: (chunk: string) => {
          this.sendCompletionChunk(chunk);
          fullText += chunk;
        },
      });

      this.sendCompletionDone(fullText, {
        promptTokens: prompt.length / 4, // Estimativa simples
        completionTokens: fullText.length / 4, // Estimativa simples
        totalTokens: (prompt.length + fullText.length) / 4, // Estimativa simples
      });

      this.sendInfo("Completion concluída");
    } catch (error: any) {
      if (error.name === "AbortError") {
        this.sendInfo("Geração abortada pelo usuário");
      } else {
        this.sendError("Erro ao gerar completion", error.message);
        throw error;
      }
    }
  }

  /**
   * Gera respostas de chat a partir de mensagens
   * @param messages Array de mensagens (system, user, assistant)
   * @param options Opções de geração
   */
  private async generateChatCompletion(messages: any[], options?: any) {
    if (!this.context) {
      throw new Error("Contexto não criado");
    }

    try {
      this.sendInfo("Gerando chat completion...");
      this.abortController = new AbortController();

      let fullText = "";

      await this.context.chat({
        messages,
        maxTokens: options?.maxTokens || 512,
        temperature: options?.temperature || 0.8,
        topP: options?.topP || 0.95,
        stopSequences: options?.stopSequences || [],
        stream: true,
        signal: this.abortController.signal,
        onToken: (chunk: string) => {
          this.sendCompletionChunk(chunk);
          fullText += chunk;
        },
      });

      this.sendCompletionDone(fullText, {
        promptTokens: JSON.stringify(messages).length / 4, // Estimativa simples
        completionTokens: fullText.length / 4, // Estimativa simples
        totalTokens: (JSON.stringify(messages).length + fullText.length) / 4, // Estimativa simples
      });

      this.sendInfo("Chat completion concluída");
    } catch (error: any) {
      if (error.name === "AbortError") {
        this.sendInfo("Geração abortada pelo usuário");
      } else {
        this.sendError("Erro ao gerar chat completion", error.message);
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
   * Baixa um modelo do HuggingFace ou URL direta
   * @param modelId ID do modelo (hf://org/repo) ou URL
   * @param requestId ID da requisição para rastreamento
   */
  private async downloadModel(modelId: string, requestId: string) {
    try {
      this.sendInfo(`Iniciando download do modelo: ${modelId}`);
      this.downloadAbortController = new AbortController();

      const modelsDir = path.join(process.cwd(), "models");
      if (!fs.existsSync(modelsDir)) {
        fs.mkdirSync(modelsDir, { recursive: true });
      }

      // Determinar a URL do modelo
      let modelUrl: string;
      if (modelId.startsWith("hf://")) {
        const hfPath = modelId.replace("hf://", "");
        modelUrl = `https://huggingface.co/${hfPath}/resolve/main/model.gguf`;
      } else {
        modelUrl = modelId;
      }

      const fileName = path.basename(modelUrl);
      const filePath = path.join(modelsDir, fileName);

      // Implementação manual de download com progresso
      await this.downloadFile(modelUrl, filePath, (progress) => {
        this.sendDownloadProgress(requestId, progress);
      });

      this.sendDownloadComplete(requestId, filePath);
      this.sendInfo(`Modelo baixado com sucesso: ${filePath}`);
    } catch (error: any) {
      if (error.name === "AbortError") {
        this.sendInfo("Download abortado pelo usuário");
      } else {
        this.sendDownloadError(requestId, error.message);
        this.sendError("Erro ao baixar modelo", error.message);
      }
    } finally {
      this.downloadAbortController = null;
    }
  }

  /**
   * Aborta uma operação de geração em andamento
   */
  private abort() {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
      this.sendInfo("Operação abortada");
    }
  }

  /**
   * Aborta um download em andamento
   */
  private abortDownload() {
    if (this.downloadAbortController) {
      this.downloadAbortController.abort();
      this.downloadAbortController = null;
      this.sendInfo("Download abortado");
    }
  }

  /**
   * Libera recursos ao encerrar o worker
   */
  public cleanup() {
    this.abort();
    this.abortDownload();

    if (this.context) {
      this.context.dispose();
      this.context = null;
    }

    if (this.model) {
      this.model.dispose();
      this.model = null;
    }

    this.sendInfo("Recursos liberados");
  }
}

// Inicialização do worker
parentPort?.once("message", async (messageData) => {
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
