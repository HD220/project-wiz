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
  ModelDownloader,
  LlamaModelOptions,
  LlamaChatSessionOptions,
  ChatHistoryItem,
} from "node-llama-cpp";

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
        await this.loadModel(message.options);
        break;
      case "create_context":
        await this.createContext();
        break;
      case "generate_completion":
        // Usar o novo método unificado para prompt simples
        await this.generateText(message.prompt, message.options);
        break;
      case "generate_chat_completion":
        // Usar o novo método unificado para mensagens de chat
        await this.generateText(message.messages, message.options);
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
   *
   * Nota: Esta versão refatorada aceita diretamente um objeto LlamaModelOptions
   * em vez de parâmetros separados, para maior flexibilidade e compatibilidade
   * com a API atual do node-llama-cpp.
   *
   * @param options Opções de carregamento do modelo, incluindo modelPath
   */
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

  /**
   * Garante que uma sessão de chat esteja disponível
   *
   * Cria uma nova instância de LlamaChatSession se não existir,
   * usando a sequência de contexto atual e opções de configuração flexíveis.
   *
   * Características:
   * - Usa a sequência de contexto atual como base
   * - Permite configurações personalizadas via LlamaChatSessionOptions
   * - Suporta prompt de sistema, wrappers de chat, e outras configurações avançadas
   *
   * A sessão é criada usando a API moderna do LlamaChatSession com contextSequence,
   * conforme recomendado na documentação.
   *
   * @param options Opções de configuração da sessão de chat, exceto contextSequence
   */
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

  /**
   * Gera texto usando LlamaChatSession
   *
   * Este método unificado substitui os antigos generateCompletion e generateChatCompletion,
   * usando exclusivamente o LlamaChatSession para todas as interações de geração de texto.
   *
   * Suporta dois tipos de entrada:
   * 1. String: Tratada como um prompt simples
   * 2. Array de ChatMessage: Tratada como uma sequência de mensagens de chat
   *
   * Todas as opções são passadas diretamente para o LlamaChatSession.prompt(),
   * permitindo o uso de todas as funcionalidades nativas da biblioteca.
   *
   * @param input Texto de entrada (string) ou mensagens de chat (ChatMessage[])
   * @param options Opções de geração (todas as opções do LlamaChatSession são suportadas)
   */
  private async generateText(
    input: string | ChatHistoryItem[],
    options?: Omit<LlamaChatSessionOptions, "contextSequences">
  ) {
    try {
      this.sendInfo("Gerando texto...");
      this.abortController = new AbortController();

      // Garantir que a sessão de chat existe
      await this.ensureChatSession(options);

      let fullText = "";

      // Preparar opções para o LlamaChatSession
      const promptOptions: LLamaChatPromptOptions = {
        // Passar todas as opções diretamente para manter compatibilidade com a API
        ...options,

        // Garantir que o signal e onTextChunk estejam configurados
        signal: this.abortController.signal,
        onTextChunk: (chunk: string) => {
          this.sendCompletionChunk(chunk);
          fullText += chunk;
        },
      };

      // Determinar se a entrada é um prompt simples ou mensagens de chat
      if (typeof input === "string") {
        // Caso de prompt simples
        await this.chatSession.prompt(input, promptOptions);
      } else {
        // Caso de mensagens de chat
        // Definir o histórico de chat (todas as mensagens exceto a última)
        this.chatSession.setChatHistory(input.slice(0, -1));

        // Usar a última mensagem como prompt
        const lastMessage = input[input.length - 1];

        // Verificar o tipo da mensagem
        // Se for uma mensagem do usuário, usamos seu texto como prompt
        // Se for uma mensagem do assistente ou sistema, usamos um prompt vazio
        // Isso garante que o modelo continue a partir do contexto correto
        if (lastMessage.type == "user") {
          await this.chatSession.prompt(lastMessage.text, promptOptions);
        } else {
          await this.chatSession.prompt("", promptOptions);
        }
      }

      // Calcular estatísticas aproximadas
      const inputSize =
        typeof input === "string"
          ? input.length / 4
          : JSON.stringify(input).length / 4;

      this.sendCompletionDone(fullText, {
        promptTokens: inputSize,
        completionTokens: fullText.length / 4,
        totalTokens: inputSize + fullText.length / 4,
      });

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

// Inicialização do worker
// Nota: Esta implementação foi refatorada para usar exclusivamente o LlamaChatSession
// para todas as interações de geração de texto, conforme o plano de refatoração.
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
