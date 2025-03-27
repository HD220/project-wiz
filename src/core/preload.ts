import { contextBridge, ipcRenderer } from "electron";
import { LlamaAPI } from "./electronAPI";

const { port1: llamaAPI, port2: llamaService } = new MessageChannel();

// Enviar o port2 para o processo principal
ipcRenderer.postMessage("llama-worker-port", null, [llamaService]);

// Funções da API que serão expostas ao renderer
const electronAPI: { llm: LlamaAPI } = {
  llm: {
    init: (options) => {
      llamaAPI.postMessage({ type: "init", options });
    },

    loadModel: (modelPath, options) => {
      llamaAPI.postMessage({ type: "load_model", modelPath, options });
    },

    createContext: () => {
      llamaAPI.postMessage({ type: "create_context" });
    },

    generateCompletion: (prompt, options) => {
      llamaAPI.postMessage({ type: "generate_completion", prompt, options });
    },

    generateChatCompletion: (messages, options) => {
      llamaAPI.postMessage({
        type: "generate_chat_completion",
        messages,
        options,
      });
    },

    downloadModel: (modelId, progressCallback) => {
      return new Promise<void>((resolve, reject) => {
        const requestId = Date.now().toString();

        const handleProgress = (event: MessageEvent) => {
          const data = event.data;
          if (
            data.type === "download_progress" &&
            data.requestId === requestId
          ) {
            progressCallback(data.progress);
          }
        };

        const handleComplete = (event: MessageEvent) => {
          const data = event.data;
          if (
            data.type === "download_complete" &&
            data.requestId === requestId
          ) {
            llamaAPI.removeEventListener("message", handleProgress);
            llamaAPI.removeEventListener("message", handleComplete);
            llamaAPI.removeEventListener("message", handleError);
            resolve();
          }
        };

        const handleError = (event: MessageEvent) => {
          const data = event.data;
          if (data.type === "download_error" && data.requestId === requestId) {
            llamaAPI.removeEventListener("message", handleProgress);
            llamaAPI.removeEventListener("message", handleComplete);
            llamaAPI.removeEventListener("message", handleError);
            reject(new Error(data.error));
          }
        };

        llamaAPI.addEventListener("message", handleProgress);
        llamaAPI.addEventListener("message", handleComplete);
        llamaAPI.addEventListener("message", handleError);

        llamaAPI.postMessage({
          type: "download_model",
          modelId,
          requestId,
        });
      });
    },

    abortDownload: () => {
      return new Promise<void>((resolve) => {
        llamaAPI.postMessage({ type: "abort_download" });
        resolve();
      });
    },

    abort: () => {
      llamaAPI.postMessage({ type: "abort" });
    },

    onModelLoaded: (callback) => {
      const handler = (event: MessageEvent) => {
        const data = event.data;
        if (data.type === "model_loaded") {
          callback(data.modelInfo);
        }
      };

      llamaAPI.addEventListener("message", handler);
      return () => llamaAPI.removeEventListener("message", handler);
    },

    onProgress: (callback) => {
      const handler = (event: MessageEvent) => {
        const data = event.data;
        if (data.type === "progress") {
          callback(data);
        }
      };

      llamaAPI.addEventListener("message", handler);
      return () => llamaAPI.removeEventListener("message", handler);
    },

    onCompletionChunk: (callback) => {
      const handler = (event: MessageEvent) => {
        const data = event.data;
        if (data.type === "completion_chunk") {
          callback(data.chunk);
        }
      };

      llamaAPI.addEventListener("message", handler);
      return () => llamaAPI.removeEventListener("message", handler);
    },

    onCompletionDone: (callback) => {
      const handler = (event: MessageEvent) => {
        const data = event.data;
        if (data.type === "completion_done") {
          callback(data);
        }
      };

      llamaAPI.addEventListener("message", handler);
      return () => llamaAPI.removeEventListener("message", handler);
    },

    onError: (callback) => {
      const handler = (event: MessageEvent) => {
        const data = event.data;
        if (data.type === "error") {
          callback(data);
        }
      };

      llamaAPI.addEventListener("message", handler);
      return () => llamaAPI.removeEventListener("message", handler);
    },
  },
};

// Expor a API para o renderer
contextBridge.exposeInMainWorld("electronAPI", electronAPI);
