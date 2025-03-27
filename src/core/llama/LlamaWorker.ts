import { MessagePortMain } from "electron";
import { LlamaCore } from "./LlamaCore";

export class LlamaWorker {
  private core: LlamaCore;

  constructor() {
    process.parentPort?.on("message", async (messageData) => {
      const [port] = messageData.ports;
      this.core = new LlamaCore(port);

      // Setup message handlers
      port.on("message", (event) => {
        const message = event.data;
        this.handleMessage(message);
      });

      port.start();
      port.postMessage("LlamaWorker ready");
    });
  }

  private async handleMessage(message: any) {
    try {
      switch (message.type) {
        case "init":
          await this.core.initialize(message.options);
          break;

        case "load_model":
          await this.core.loadModel(message.modelPath, message.options);
          break;

        case "create_context":
          await this.core.createContext();
          break;

        case "download_model":
          await this.core.downloadModel(
            message.modelId,
            message.modelUrl,
            message.outputPath
          );
          break;

        case "abort":
          this.core.abort();
          break;

        default:
          throw new Error(`Unknown message type: ${message.type}`);
      }
    } catch (error: any) {
      // Error handling
    }
  }
}

new LlamaWorker();
