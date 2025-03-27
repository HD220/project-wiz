import { MessagePortMain } from "electron";
import { EventEmitter } from "events";

export type ProgressType = "load" | "download" | "inference";
export type MessageType =
  | "info"
  | "error"
  | "progress"
  | "completion"
  | "model_loaded";

export interface LlamaMessage {
  type: MessageType;
  message?: string;
  progressType?: ProgressType;
  progress?: number;
  error?: string;
  details?: any;
}

export class LlamaMessageHandler extends EventEmitter {
  private port: MessagePortMain;

  constructor(port: MessagePortMain) {
    super();
    this.port = port;
    this.setupListeners();
  }

  private setupListeners() {
    this.port.on("message", (event) => {
      const message = event.data;
      this.emit(message.type, message);
    });
  }

  sendInfo(message: string) {
    this.port.postMessage({ type: "info", message });
  }

  sendError(error: string, details?: any) {
    this.port.postMessage({ type: "error", error, details });
  }

  sendProgress(type: ProgressType, progress: number) {
    this.port.postMessage({ type: "progress", progressType: type, progress });
  }

  sendCompletion(text: string) {
    this.port.postMessage({ type: "completion", text });
  }

  sendModelLoaded(details: { name: string; size: number }) {
    this.port.postMessage({ type: "model_loaded", details });
  }

  close() {
    this.port.close();
    this.removeAllListeners();
  }
}
