import { EventEmitter } from "events";
import type {
  LlamaModelOptions,
  LlamaContextOptions,
  LLamaChatPromptOptions,
  ModelDownloaderOptions,
  Llama,
  LlamaModel,
  LlamaContext,
  LlamaOptions,
  LlamaChatSessionOptions,
} from "node-llama-cpp";
import {
  createModelDownloader,
  LlamaChatSession
} from "node-llama-cpp";
import path from 'node:path'
import { IWorkerService } from "../../domain/ports/iworker-service.port";


export class WorkerService extends EventEmitter implements IWorkerService {
  private llama!: Llama;
  private model?: LlamaModel;
  private context?: LlamaContext;
  private session?: LlamaChatSession;

  private constructor() {
    super()
  }

  static async create(options?: LlamaOptions) {
    const instance = new WorkerService();
    await instance.initializeLlama(options);
    return instance;
  }

  private async initializeLlama(options?: LlamaOptions) {
    const { getLlama } = await import("node-llama-cpp");
    this.llama = await getLlama(options);
  }

  async loadModel(options: LlamaModelOptions) {
    this.model = await this.llama.loadModel({
      ...options,
      modelPath: path.join(__dirname, "models", options.modelPath),
    });
  }

  async createContext(options?: LlamaContextOptions) {
    if (!this.model) throw new Error("Model not loaded.");

    this.context = await this.model.createContext(options);
  }

  async initializeSession(
    options?: Omit<LlamaChatSessionOptions, "contextSequence">
  ) {
    if (!this.context) throw new Error("Context not loaded.");

    this.session = new LlamaChatSession({
      ...options,
      contextSequence: this.context.getSequence(),
    });
  }

  async prompt(prompt: string, options?: LLamaChatPromptOptions) {
    if (!this.session) throw new Error("Session not loaded.");

    const responseText = await this.session.prompt(prompt, options);

    return responseText;
  }

  async unloadModel() {
    this.session = undefined;
    this.context = undefined;
    this.model = undefined;
  }

  async downloadModel(options: ModelDownloaderOptions) {
    try {
      const modelsDir = path.join(__dirname, "models");
      const downloader = await createModelDownloader({
        ...options,
        dirPath: modelsDir,
      });

      const modelPath = await downloader.download();

      return modelPath;
    } catch (error) {
      console.error("Failed to download model:", error);
      throw error;
    }
  }
}
