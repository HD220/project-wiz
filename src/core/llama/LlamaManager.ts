import type {
  Llama,
  LlamaModel,
  LlamaContext,
  LlamaChatSession,
} from "node-llama-cpp";

export class LlamaManager {
  private llama?: Llama;
  private model?: LlamaModel;
  private sessions = new Map<string, LlamaChatSession>();

  async initialize() {
    const { getLlama } = await import("node-llama-cpp");
    this.llama = await getLlama();
    return { status: "initialized" };
  }

  async loadModel(modelPath: string) {
    if (!this.llama) throw new Error("Llama not initialized");
    this.model = await this.llama.loadModel({ modelPath });
    return { status: "model-loaded" };
  }

  async handleMessage(message: any) {
    switch (message.type) {
      case "init":
        return await this.initialize();
      case "load-model":
        return await this.loadModel(message.modelPath);
      case "create-session":
        return await this.createSession(
          message.sessionId,
          message.contextOptions
        );
      case "prompt":
        return await this.processMessage(message.sessionId, message.text);
      default:
        throw new Error(`Unsupported message type: ${message.type}`);
    }
  }

  async createSession(sessionId: string, contextOptions: any) {
    if (!this.model) throw new Error("Model not loaded");
    const context = await this.model.createContext(contextOptions);
    const { LlamaChatSession } = await import("node-llama-cpp");
    this.sessions.set(
      sessionId,
      new LlamaChatSession({ contextSequence: context.getSequence() })
    );
  }

  async processMessage(sessionId: string, message: string) {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error("Session not found");
    return session.prompt(message);
  }
}
