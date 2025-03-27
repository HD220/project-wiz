import { MessagePortMain } from "electron";
import path from "path";
import fs from "fs";
import { LlamaMessageType, LlamaMessage } from "./LlamaMessageTypes";
import { LlamaMessageHandler } from "./LlamaMessageHandler";
import { ModelManager } from "./ModelManager";
import { GenerationService } from "./GenerationService";

class LlamaWorker {
  private messageHandler: LlamaMessageHandler | null = null;
  private modelManager: ModelManager | null = null;
  private generationService: GenerationService | null = null;

  async initialize(port: MessagePortMain) {
    this.messageHandler = new LlamaMessageHandler(port);
    this.modelManager = new ModelManager(this.messageHandler);
    this.generationService = new GenerationService(
      this.messageHandler,
      this.modelManager
    );

    this.setupMessageListeners();
    port.postMessage(
      "LlamaService: Inicializado e pronto para receber comandos"
    );

    process.on("exit", () => this.cleanup());
    process.on("SIGINT", () => {
      this.cleanup();
      process.exit(0);
    });
  }

  private setupMessageListeners() {
    if (!this.messageHandler) return;

    this.messageHandler.on(LlamaMessageType.INIT, this.handleInit.bind(this));
    this.messageHandler.on(
      LlamaMessageType.LOAD_MODEL,
      this.handleLoadModel.bind(this)
    );
    this.messageHandler.on(
      LlamaMessageType.CREATE_CONTEXT,
      this.handleCreateContext.bind(this)
    );
    this.messageHandler.on(
      LlamaMessageType.GENERATE_COMPLETION,
      this.handleGenerateCompletion.bind(this)
    );
    this.messageHandler.on(
      LlamaMessageType.GENERATE_CHAT_COMPLETION,
      this.handleGenerateChatCompletion.bind(this)
    );
    this.messageHandler.on(
      LlamaMessageType.CREATE_EMBEDDING,
      this.handleCreateEmbedding.bind(this)
    );
    this.messageHandler.on(LlamaMessageType.ABORT, this.handleAbort.bind(this));
    this.messageHandler.on(
      LlamaMessageType.DOWNLOAD_MODEL,
      this.handleDownloadModel.bind(this)
    );
    this.messageHandler.on(
      LlamaMessageType.SHUTDOWN,
      this.handleShutdown.bind(this)
    );
  }

  private async handleInit(message: any) {
    try {
      const { options } = message;
      this.messageHandler?.sendInfo("Inicializando node-llama-cpp...");
      await this.modelManager?.initialize(options);
      this.messageHandler?.sendInfo("node-llama-cpp inicializado com sucesso");
    } catch (error: any) {
      this.messageHandler?.sendError(
        "Falha ao inicializar node-llama-cpp",
        error.message
      );
    }
  }

  private async handleLoadModel(message: any) {
    try {
      const { modelPath } = message;
      this.messageHandler?.sendInfo(`Carregando modelo: ${modelPath}`);
      await this.modelManager?.loadModel(modelPath);
    } catch (error: any) {
      this.messageHandler?.sendError("Erro ao carregar modelo", error.message);
    }
  }

  private async handleCreateContext() {
    try {
      this.messageHandler?.sendInfo("Criando contexto...");
      await this.modelManager?.createContext();
      this.messageHandler?.sendInfo("Contexto criado com sucesso");
    } catch (error: any) {
      this.messageHandler?.sendError("Erro ao criar contexto", error.message);
    }
  }

  private async handleGenerateCompletion(message: any) {
    try {
      const { prompt, options } = message;
      this.messageHandler?.sendInfo(
        `Gerando completion para prompt: ${prompt.substring(0, 50)}...`
      );
      await this.generationService?.generateCompletion(prompt, options);
    } catch (error: any) {
      if (error.name === "AbortError") {
        this.messageHandler?.sendInfo(
          "Geração de completion abortada pelo usuário"
        );
      } else {
        this.messageHandler?.sendError(
          "Erro ao gerar completion",
          error.message
        );
      }
    }
  }

  private async handleGenerateChatCompletion(message: any) {
    try {
      const { messages, options } = message;
      this.messageHandler?.sendInfo("Gerando chat completion...");
      await this.generationService?.generateChatCompletion(messages, options);
    } catch (error: any) {
      if (error.name === "AbortError") {
        this.messageHandler?.sendInfo(
          "Geração de chat completion abortada pelo usuário"
        );
      } else {
        this.messageHandler?.sendError(
          "Erro ao gerar chat completion",
          error.message
        );
      }
    }
  }

  private async handleCreateEmbedding(message: any) {
    try {
      const { text } = message;
      this.messageHandler?.sendInfo("Criando embedding...");
      const embedding = await this.modelManager?.createEmbedding(text);
      this.messageHandler?.sendInfo("Embedding criado com sucesso");
      this.messageHandler?.sendInfo(
        `Embedding result: ${JSON.stringify({ embedding }).substring(
          0,
          100
        )}...`
      );
    } catch (error: any) {
      this.messageHandler?.sendError("Erro ao criar embedding", error.message);
    }
  }

  private handleAbort() {
    this.generationService?.abort();
  }

  private async handleDownloadModel(message: any) {
    try {
      const { modelId, modelUrl, outputPath } = message;
      const targetDir = outputPath;

      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }

      this.messageHandler?.sendInfo(`Iniciando download do modelo: ${modelId}`);

      let url = modelUrl;
      if (!url) {
        if (modelId.startsWith("hf://")) {
          const hfPath = modelId.replace("hf://", "");
          url = `https://huggingface.co/${hfPath}/resolve/main/model.gguf`;
        } else {
          this.messageHandler?.sendError(
            "URL do modelo não especificada",
            "Forneça uma URL ou use o formato hf://org/repo"
          );
          return;
        }
      }

      const fileName = path.basename(url);
      const outputFilePath = path.join(targetDir, fileName);

      const { execFile } = await import("child_process");
      const npx = process.platform === "win32" ? "npx.cmd" : "npx";

      await new Promise<void>((resolve, reject) => {
        const process = execFile(
          npx,
          ["--no", "node-llama-cpp", "pull", "--dir", targetDir, url],
          (error: Error | null, stdout: string, stderr: string) => {
            if (error) {
              reject(error);
              return;
            }

            if (stderr) {
              console.error("Download stderr:", stderr);
            }

            console.log("Download stdout:", stdout);
            resolve();
          }
        );

        let progress = 0;
        const progressInterval = setInterval(() => {
          progress += 0.05;
          if (progress > 0.95) {
            progress = 0.95;
            clearInterval(progressInterval);
          }
          this.messageHandler?.sendProgress("download", progress);
        }, 500);

        process.on("close", () => {
          clearInterval(progressInterval);
          resolve();
        });
      });

      this.messageHandler?.sendInfo(
        `Modelo baixado com sucesso: ${outputFilePath}`
      );
      this.messageHandler?.sendProgress("download", 1.0);
    } catch (error: any) {
      this.messageHandler?.sendError("Erro ao baixar modelo", error.message);
    }
  }

  private handleShutdown() {
    this.cleanup();
    this.messageHandler?.sendInfo("Serviço encerrado");
    setTimeout(() => {
      process.exit(0);
    }, 100);
  }

  private cleanup() {
    this.modelManager?.cleanup();
    this.generationService?.abort();

    if (this.messageHandler) {
      this.messageHandler.close();
      this.messageHandler = null;
    }
  }
}

process.parentPort.once("message", async (messageData) => {
  try {
    const [port] = messageData.ports;
    const worker = new LlamaWorker();
    await worker.initialize(port);
    port.start();
  } catch (error) {
    console.error("LlamaService: Erro ao processar mensagem", error);
    process.exit(1);
  }
});
