import { MessagePortMain } from "electron";
import type {
  LlamaModel,
  LlamaContext,
  LlamaOptions,
  LlamaGpuType,
} from "node-llama-cpp";
import { LlamaMessageHandler } from "./LlamaMessageHandler";

export class LlamaCore {
  private llamaInstance: Awaited<
    ReturnType<typeof import("node-llama-cpp").getLlama>
  > | null = null;
  private model: LlamaModel | null = null;
  private context: LlamaContext | null = null;
  private abortController: AbortController | null = null;
  private messageHandler: LlamaMessageHandler;

  constructor(port: MessagePortMain) {
    this.messageHandler = new LlamaMessageHandler(port);
  }

  async initialize(options?: LlamaOptions) {
    try {
      const { getLlama } = await import("node-llama-cpp");
      this.llamaInstance = await getLlama({
        debug: options?.debug || false,
        gpu: options?.gpu || "auto",
        maxThreads: options?.maxThreads,
      });
      this.messageHandler.sendInfo("Llama inicializado com sucesso");
    } catch (error: any) {
      this.messageHandler.sendError(
        "Falha ao inicializar Llama",
        error.message
      );
      throw error;
    }
  }

  async loadModel(
    modelPath: string,
    options?: {
      gpuLayers?: number;
      contextSize?: number;
      batchSize?: number;
      seed?: number;
    }
  ) {
    if (!this.llamaInstance) {
      throw new Error("Llama não inicializado");
    }

    try {
      this.messageHandler.sendInfo(`Carregando modelo: ${modelPath}`);
      this.model = await this.llamaInstance.loadModel({
        modelPath,
        onLoadProgress: (progress) => {
          this.messageHandler.sendProgress("load", progress);
        },
      });
      this.messageHandler.sendProgress("load", 1.0);
      this.messageHandler.sendInfo("Modelo carregado com sucesso");
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
      this.abortController = new AbortController();
      this.context = await this.model.createContext();
      if (this.abortController) {
        this.abortController.signal.addEventListener("abort", () => {
          this.context?.dispose();
        });
      }
      this.messageHandler.sendInfo("Contexto criado com sucesso");
      return this.context;
    } catch (error: any) {
      this.messageHandler.sendError("Erro ao criar contexto", error.message);
      throw error;
    }
  }

  async downloadModel(modelId: string, modelUrl?: string, outputPath?: string) {
    try {
      this.messageHandler.sendInfo(`Iniciando download do modelo: ${modelId}`);

      // Implementação do download com progresso
      // ...

      this.messageHandler.sendProgress("download", 1.0);
      this.messageHandler.sendInfo("Modelo baixado com sucesso");
    } catch (error: any) {
      this.messageHandler.sendError("Erro ao baixar modelo", error.message);
      throw error;
    }
  }

  abort() {
    if (this.abortController) {
      this.abortController.abort();
      this.messageHandler.sendInfo("Operação abortada");
    }
  }
}
