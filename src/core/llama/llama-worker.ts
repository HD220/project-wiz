import { modelDownload } from "./download";
import type { LlamaUtilityMessage } from "./types";
import type {
  LlamaChatSession,
  LlamaModel,
  LlamaContext,
} from "node-llama-cpp";

enum WorkerState {
  Downloading = "downloading",
  Loading = "loading",
  Prompting = "prompting",
  Answering = "answering",
  Standby = "standby",
  Error = "error",
}

let state: WorkerState = WorkerState.Standby;
let session: LlamaChatSession | null = null;
let model: LlamaModel | null = null;
let context: LlamaContext | null = null;
let parentPort: Electron.MessagePortMain | null = null;

process.parentPort.once("message", async ({ ports }) => {
  const [port] = ports;
  parentPort = port;
  port.start();

  await initializeModel();
});

function updateState(newState: WorkerState) {
  state = newState;
  parentPort?.postMessage({ type: "stateChange", state });
}

async function initializeModel() {
  try {
    updateState(WorkerState.Downloading);

    const { getLlama, LlamaChatSession } = await import("node-llama-cpp");
    const llama = await getLlama({
      logger: (level, message) => {
        parentPort?.postMessage({ type: "log", level, message });
      },
      progressLogs: true,
      maxThreads: 4,
    });

    const modelPath = await modelDownload({
      //uri: 'https://huggingface.co/bartowski/gemma-2-2b-it-GGUF/resolve/main/gemma-2-2b-it-Q4_K_M.gguf',
      uri: "hf:bartowski/gemma-2-2b-it-GGUF:Q4_K_M",
      onProgress(status) {
        const progress = status.downloadedSize
          ? status.downloadedSize / status.totalSize
          : 0.0;
        parentPort?.postMessage({ type: "downloadProgress", progress });
      },
    });

    updateState(WorkerState.Loading);
    model = await llama.loadModel({
      modelPath,
      onLoadProgress: (progress) => {
        parentPort?.postMessage({ type: "loadProgress", progress });
      },
    });

    context = await model.createContext({ threads: 4 });
    session = new LlamaChatSession({ contextSequence: context.getSequence() });

    updateState(WorkerState.Standby);
    parentPort?.postMessage({ type: "ready" });
  } catch (error) {
    updateState(WorkerState.Error);
    process.send?.({
      type: "error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

async function handlePrompt(prompt: string) {
  if (!session) {
    throw new Error("Model not initialized");
  }

  updateState(WorkerState.Prompting);
  const response = await session.prompt(prompt, {
    onTextChunk: (text) => {
      updateState(WorkerState.Answering);
      parentPort?.postMessage({ type: "textChunk", text });
    },
  });

  updateState(WorkerState.Standby);
  return response;
}

parentPort?.on("message", async (event: { data: LlamaUtilityMessage }) => {
  const message = event.data;
  try {
    switch (message.type) {
      case "init":
        await initializeModel();
        break;

      case "prompt":
        await handlePrompt(message.prompt);
        break;
    }
  } catch (error) {
    updateState(WorkerState.Error);
    parentPort?.postMessage({
      type: "error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

process.on("SIGKILL", () => {
  process.abort();
});
