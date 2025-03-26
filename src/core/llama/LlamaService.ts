import { LlamaProcessManager } from "./LlamaProcessManager";
import { WorkerType } from "./types";

export class LlamaService {
  private processManager: LlamaProcessManager;

  constructor() {
    this.processManager = new LlamaProcessManager();
  }

  async initializeWorker(type: WorkerType): Promise<void> {
    await this.processManager.createWorker(type);
  }

  async loadModel(type: WorkerType, modelUri: string): Promise<void> {
    await this.processManager.loadModel(type, modelUri);
  }

  async createSession(
    type: WorkerType,
    sessionId: string,
    contextOptions?: any,
    sessionOptions?: any
  ): Promise<void> {
    await this.processManager.createSession(
      type,
      sessionId,
      contextOptions,
      sessionOptions
    );
  }

  async sendMessage<T>(type: WorkerType, message: T): Promise<any> {
    return this.processManager.sendMessage(type, message);
  }

  async shutdown(): Promise<void> {
    await this.processManager.shutdown();
  }
}
