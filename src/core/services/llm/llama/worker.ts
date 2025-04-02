import { fileURLToPath } from "url";
import path from "path";

import {
  getLlama,
  Llama,
  LLamaChatPromptOptions,
  LlamaChatSession,
  LlamaChatSessionOptions,
  LlamaContext,
  LlamaContextOptions,
  LlamaModel,
  LlamaModelOptions,
  LlamaOptions,
} from "node-llama-cpp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export class LlamaWorker {
  private llama!: Llama;
  private model?: LlamaModel;
  private context?: LlamaContext;
  private session?: LlamaChatSession;

  private constructor() {}

  static async create(options?: LlamaOptions) {
    const instance = new LlamaWorker();
    await instance.initializeLlama(options);
    return instance;
  }

  private async initializeLlama(options?: LlamaOptions) {
    // const { getLlama } = await import("node-llama-cpp");
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
}
