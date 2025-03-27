export interface LlamaCoreInterface {
  initialize(options: any): Promise<void>;
  loadModel(modelPath: string, options: any): Promise<void>;
  createContext(): Promise<void>;
  downloadModel(
    modelId: string,
    modelUrl: string,
    outputPath: string
  ): Promise<void>;
  abort(): Promise<void>;
}

export class LlamaWrapper {
  private core: LlamaCoreInterface;

  constructor(core: LlamaCoreInterface) {
    this.core = core;
  }

  /**
   * Processa mensagens recebidas via MessagePort e invoca os métodos correspondentes na lib node-llama-cpp.
   * A estrutura da mensagem deve ter a propriedade "type" e os parâmetros necessários.
   */
  public async processMessage(message: any): Promise<any> {
    switch (message.type) {
      case "init":
        return await this.core.initialize(message.options);
      case "load_model":
        return await this.core.loadModel(message.modelPath, message.options);
      case "create_context":
        return await this.core.createContext();
      case "download_model":
        return await this.core.downloadModel(
          message.modelId,
          message.modelUrl,
          message.outputPath
        );
      case "abort":
        return await this.core.abort();
      default:
        throw new Error(`Unknown message type: ${message.type}`);
    }
  }
}
