import { EventEmitter } from "events";
import { MessageChannelMain, UtilityProcess, utilityProcess } from "electron";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { LlamaUtilityMessage } from "./types";

type LlamaEventMap = {
  [K in LlamaUtilityMessage["type"]]: [
    data: {
      [P in keyof Extract<LlamaUtilityMessage, { type: K }> as P extends "type"
        ? never
        : P]: Extract<LlamaUtilityMessage, { type: K }>[P];
    }
  ];
};

export class LlamaProcessManager extends EventEmitter<
  LlamaEventMap & {
    stdout: [any];
    stderr: [any];
    downloadModel: [string];
    downloadComplete: [];
    downloadError: [Error];
  }
> {
  private process: UtilityProcess | null = null;
  private mainPort: MessageChannelMain["port1"];
  private childPort: MessageChannelMain["port2"];

  constructor() {
    super();
    const { port1, port2 } = new MessageChannelMain();
    this.mainPort = port1;
    this.childPort = port2;

    const workerPath = path.join(__dirname, "../llama/llama-worker.js");

    this.process = utilityProcess.fork(workerPath, [], {
      serviceName: "llama-process",
      stdio: "pipe",
    });

    this.setupEventListeners();
  }

  private setupEventListeners() {
    if (!this.process) return;

    this.process.stdout?.on("data", (data) => {
      this.emit("stdout", data);
      console.log(`[LLAMA] stdout: ${data}`);
    });

    this.process.stderr?.on("data", (data) => {
      this.emit("stderr", data);
      console.error(`[LLAMA] stderr: ${data}`);
    });

    this.process.on("spawn", () => {
      this.process?.postMessage("init", [this.childPort]);

      this.mainPort.on("message", (event) => {
        const { data } = event;
        const { type, ...message }: LlamaUtilityMessage = data;

        if (type === "ready") {
          this.mainPort.emit("prompt", { text: "" });
        }

        this.emit(type, message);
      });

      this.mainPort.start();
    });

    this.process.on("exit", (code) => {
      if (code !== 0) {
        console.error(
          "error",
          `[LLAMA] Process stopped with exit code ${code}`
        );
      }
      this.mainPort.close();
    });

    this.on("prompt", (prompt) => {
      console.log("sending", prompt);
      this.mainPort.postMessage({
        type: "prompt",
        prompt,
      });
    });
  }

  public shutdown() {
    if (this.process) {
      this.process.kill();
    }
  }
}
