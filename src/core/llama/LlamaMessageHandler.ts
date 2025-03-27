import { MessagePortMain } from "electron";
import { EventEmitter } from "events";
import { LlamaMessageType, LlamaMessage } from "./LlamaMessageTypes";

export class LlamaMessageHandler extends EventEmitter {
  private port: MessagePortMain;

  constructor(port: MessagePortMain) {
    super();
    this.port = port;
  }

  sendInfo(message: string) {
    this.port.postMessage({ type: "info", message });
  }

  sendError(title: string, message: string) {
    this.port.postMessage({ type: "error", title, message });
  }

  sendProgress(type: string, progress: number) {
    this.port.postMessage({ type: "progress", progressType: type, progress });
  }

  sendCompletionChunk(chunk: string) {
    this.port.postMessage({ type: "completion_chunk", chunk });
  }

  sendCompletionDone(text: string) {
    this.port.postMessage({ type: "completion_done", text });
  }

  sendModelLoaded(details: { name: string; size: number }) {
    this.port.postMessage({ type: "model_loaded", details });
  }

  close() {
    this.port.close();
  }
}
