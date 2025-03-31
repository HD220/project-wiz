import { fileURLToPath } from "url";
import path from "path";
import {
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

export class LLMWorker {
  private llama?: Llama;
  private model?: LlamaModel;
  private context?: LlamaContext;
  private session?: LlamaChatSession;

  constructor() {}

  async initializeLlama(options?: LlamaOptions) {
    const { getLlama } = await import("node-llama-cpp");
    this.llama = await getLlama(options);
  }

  async loadModel(options: LlamaModelOptions) {
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    this.model = await this.llama.loadModel({
      ...options,
      modelPath: path.join(__dirname, "models", options.modelPath),
    });
  }

  async createContext(options?: LlamaContextOptions) {
    this.context = await this.model.createContext(options);
  }

  async initializeSession(
    options?: Omit<LlamaChatSessionOptions, "contextSequence">
  ) {
    this.session = new LlamaChatSession({
      ...options,
      contextSequence: this.context.getSequence(),
    });
  }

  async processRequest(prompt: string, options?: LLamaChatPromptOptions) {
    if (!this.session) {
      throw new Error("LLM worker not initialized");
    }

    const responseText = await this.session.prompt(prompt, options);

    return responseText;
  }
}
