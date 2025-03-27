import { LlamaModel, LlamaOptions } from "node-llama-cpp";
import { LlamaMessageHandler } from "./LlamaMessageHandler";

export class ModelManager {
  private llamaInstance: Awaited<ReturnType<typeof getLlama>> | null = null;
  private model: LlamaModel | null = null;
  private context: any = null;
  private messageHandler: LlamaMessageHandler;

  constructor(messageHandler: LlamaMessageHandler) {
    this.messageHandler = messageHandler;
  }

  async initialize(options?: LlamaOptions) {
    try {
      const { getLlama } = await import("node-llama-cpp");
      this.llamaInstance = await getLlama({
        debug: options?.debug || false,
        gpu: options?.gpu || "auto",
        maxThreads: options?.maxThreads,
      });
      this.messageHandler.sendInfo("node-llama-cpp inicializado com sucesso");
    } catch (error: any) {
      this.messageHandler.sendError(
        "Falha ao inicializar node-llama-cpp",
        error.message
      );
      throw error;
    }
  }

  async loadModel(modelPath: string) {
    if (!this.llamaInstance) {
      throw new Error("Llama não inicializado");
    }

    try {
      this.messageHandler.sendInfo(`Carregando modelo: ${modelPath}`);
      this.model = await this.llamaInstance.loadModel({
        modelPath,
        onLoadProgress: (loadProgress) => {
          this.messageHandler.sendProgress("load", loadProgress);
        },
      });

      this.messageHandler.sendProgress("load", 1.0);
      this.messageHandler.sendModelLoaded({
        name: this.model.filename,
        size: this.model.size,
      });
      this.messageHandler.sendInfo(
        `Modelo carregado com sucesso: ${this.model.filename}`
      );
    } catch (error: any) {
      this.messageHandler.sendError("Erro ao carregar modelo", error.message);
      throw error;
    }
  }

  async createContext() {
    if (!this.model) {
      throw new Error("Modelo não carregado");
    }

    try {
      this.context = await this.model.createContext();
      this.messageHandler.sendInfo("Contexto criado com sucesso");
      return this.context;
    } catch (error: any) {
      this.messageHandler.sendError("Erro ao criar contexto", error.message);
      throw error;
    }
  }

  async createEmbedding(text: string) {
    if (!this.model) {
      throw new Error("Modelo não carregado");
    }

    try {
      this.messageHandler.sendInfo("Criando embedding...");
      const embeddingContext = await this.model.createEmbeddingContext();
      const embedding = await embeddingContext.getEmbeddingFor(text);
      this.messageHandler.sendInfo("Embedding criado com sucesso");
      return embedding;
    } catch (error: any) {
      this.messageHandler.sendError("Erro ao criar embedding", error.message);
      throw error;
    }
  }

  cleanup() {
    this.context = null;
    this.model = null;
    this.llamaInstance = null;
  }
}

async function getLlama(options?: LlamaOptions) {
  const { getLlama } = await import("node-llama-cpp");
  return getLlama(options);
}
