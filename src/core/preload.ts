import { contextBridge, ipcRenderer } from "electron";
import {
  LlamaClientMessageType,
  LlamaWorkerResponseType,
} from "./llama/llama-types";

// Configuração do MessagePort para comunicação com o worker
let llamaPort: MessagePort;

contextBridge.exposeInMainWorld("electronAPI", {
  // Solicita porta de comunicação com o worker
  requestLlamaPort: () => {
    ipcRenderer.postMessage("request-llama-port", null);
  },

  // Configura handlers de eventos do LLM
  setupLlamaHandlers: (handlers: {
    onModelLoaded: (modelInfo: any) => void;
    onProgress: (data: { operation: string; progress: number }) => void;
    onCompletionChunk: (chunk: string) => void;
    onCompletionDone: (data: any) => void;
    onError: (error: string) => void;
    onDownloadProgress: (requestId: string, progress: number) => void;
    onDownloadComplete: (requestId: string, filePath: string) => void;
    onDownloadError: (requestId: string, error: string) => void;
  }) => {
    if (!llamaPort) return;

    const messageHandler = (event: MessageEvent<LlamaWorkerResponseType>) => {
      switch (event.data.type) {
        case "model_loaded":
          handlers.onModelLoaded(event.data.modelInfo);
          break;
        case "progress":
          handlers.onProgress({
            operation: event.data.operation,
            progress: event.data.progress,
          });
          break;
        case "completion_chunk":
          handlers.onCompletionChunk(event.data.chunk);
          break;
        case "completion_done":
          handlers.onCompletionDone(event.data);
          break;
        case "error":
          handlers.onError(event.data.error);
          break;
        case "download_progress":
          handlers.onDownloadProgress(
            event.data.requestId,
            event.data.progress
          );
          break;
        case "download_complete":
          handlers.onDownloadComplete(
            event.data.requestId,
            event.data.filePath
          );
          break;
        case "download_error":
          handlers.onDownloadError(event.data.requestId, event.data.error);
          break;
      }
    };

    llamaPort.addEventListener("message", messageHandler);
    return () => llamaPort.removeEventListener("message", messageHandler);
  },

  // Métodos para enviar comandos ao worker
  sendToLlamaWorker: (message: LlamaClientMessageType) => {
    if (llamaPort) {
      llamaPort.postMessage(message);
    }
  },
});

// Recebe a porta do processo principal
ipcRenderer.on("llama-port", (event) => {
  [llamaPort] = event.ports;
  llamaPort.start();

  // Disparar evento para notificar que a porta está pronta
  window.dispatchEvent(new Event("llama-port-ready"));
});
