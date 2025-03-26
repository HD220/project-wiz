import {
  MessageChannelMain,
  MessagePortMain,
  UtilityProcess,
  utilityProcess,
} from "electron";
import type { LlamaUtilityMessage } from "./types";
import { EventEmitter } from "node:stream";
import path from "node:path";
import { fileURLToPath } from "node:url";

export class LlamaProcessManager extends EventEmitter {
  private process: UtilityProcess;
  private mainPort: MessagePortMain;

  constructor() {
    super();

    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const workerPath = path.join(__dirname, "llama/llama-worker.js");

    const { port1, port2 } = new MessageChannelMain();
    this.mainPort = port1;
    this.mainPort.start();

    this.process = utilityProcess.fork(workerPath, [], {
      serviceName: "llama-process",
      stdio: "pipe",
    });

    this.process.on("spawn", () => {
      try {
        this.process.postMessage("port-transfer", [port2]);

        this.mainPort.on("message", (event) => {
          const data = event.data as LlamaUtilityMessage;
          switch (data.type) {
            case "worker-loaded":
              this.mainPort.postMessage({
                type: "init",
              } as LlamaUtilityMessage);
              break;
            case "init-response":
              console.log("llm inicializada");
            default:
              break;
          }
        });
      } catch (error) {
        console.error("Error setting up message handling:", error);
      }
    });

    this.setupProcessListeners();
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

  public shutdown(): void {
    if (this.process) {
      try {
        this.process.kill();
        this.mainPort.close();
        console.log("Llama process shutdown initiated");
      } catch (error) {
        console.error("Error during process shutdown:", error);
      }
    }
  }
}
