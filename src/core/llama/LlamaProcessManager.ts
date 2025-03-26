import {
  MessageChannelMain,
  MessagePortMain,
  UtilityProcess,
  utilityProcess,
} from "electron";
import { EventEmitter } from "node:stream";
import path from "node:path";
import { fileURLToPath } from "node:url";
import LlamaWorkerFactory from "./LlamaWorkerFactory";
import {
  WorkerType,
  WorkerMessage,
  WorkerEvent,
  LlamaContextOptions,
  LlamaChatSessionOptions,
} from "./types";

export class LlamaProcessManager extends EventEmitter {
  private process: UtilityProcess;
  private mainPort: MessagePortMain;
  private workers = new Map<WorkerType, any>();

  constructor() {
    super();
    this.initializeProcess();
  }

  private initializeProcess() {
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const workerPath = path.join(__dirname, "llama-worker.js");

    const { port1, port2 } = new MessageChannelMain();
    this.mainPort = port1;
    this.mainPort.start();

    this.process = utilityProcess.fork(workerPath, [], {
      serviceName: "llama-process",
      stdio: "pipe",
    });

    this.process.on("spawn", () => {
      this.process.postMessage("port-transfer", [port2]);
      this.setupMessageHandlers();
      this.setupProcessListeners();
    });
  }

  private setupMessageHandlers() {
    this.mainPort.on("message", async (event) => {
      const message = event.data as WorkerMessage;
      const worker = this.workers.get(message.type as WorkerType);

      if (worker) {
        const response = await worker.processMessage(message);
        this.mainPort.postMessage(response);
      }
    });
  }

  private setupProcessListeners(): void {
    if (!this.process) return;

    this.process.stdout.on("data", (data) => {
      console.log(`[LLAMA] stdout: ${data}`);
    });

    this.process.stderr.on("data", (data) => {
      console.error(`[LLAMA] stderr: ${data}`);
    });

    this.process.on("exit", (code) => {
      if (code !== 0) {
        console.error(
          `[LLAMA] Process stopped with non-zero exit code: ${code}`
        );
      }

      try {
        this.mainPort.close();
      } catch (error) {
        console.error("Error closing main port:", error);
      }
    });
  }

  // public onMessage<EventName extends keyof LlamaEventMap = keyof LlamaEventMap>(
  //   eventName: EventName,
  //   callback: (data?: LlamaEventMap[EventName][0]) => void
  // ): void {
  //   this.mainPort.on("message", (event) => {
  //     const {
  //       data: { type, ...data },
  //     } = event.data as {
  //       data: LlamaEventMap[EventName][number] & { type: EventName };
  //     };

  //     if (type === eventName) {
  //       callback(data as unknown as LlamaEventMap[EventName][number]);
  //     }
  //   });
  // }

  // public postMessage<
  //   EventName extends keyof LlamaEventMap = keyof LlamaEventMap
  // >(eventName: EventName, data?: LlamaEventMap[EventName][0]): void {
  //   this.mainPort.postMessage({ type: eventName, ...data });
  // }

  async createWorker(type: WorkerType): Promise<void> {
    const worker = LlamaWorkerFactory.createWorker(type);
    await worker.initialize();
    this.workers.set(type, worker);
  }

  async loadModel(type: WorkerType, modelUri: string): Promise<void> {
    const worker = this.workers.get(type);
    if (!worker) throw new Error(`Worker ${type} not initialized`);
    await worker.loadModel(modelUri);
  }

  async sendMessage(type: WorkerType, message: any): Promise<any> {
    const worker = this.workers.get(type);
    if (!worker) throw new Error(`Worker ${type} not initialized`);
    return worker.processMessage(message);
  }

  async createSession(
    type: WorkerType,
    sessionId: string,
    contextOptions?: LlamaContextOptions,
    sessionOptions?: LlamaChatSessionOptions
  ): Promise<void> {
    const worker = this.workers.get(type);
    if (!worker) throw new Error(`Worker ${type} not initialized`);
    await worker.createSession(sessionId, contextOptions, sessionOptions);
  }

  public shutdown(): void {
    if (this.process) {
      try {
        this.process.kill();
        this.mainPort.close();
        this.workers.clear();
        console.log("Llama process shutdown initiated");
      } catch (error) {
        console.error("Error during process shutdown:", error);
      }
    }
  }
}
