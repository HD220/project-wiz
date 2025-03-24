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

process.parentPort.once("message", async (event) => {
  const { ports, data } = event;
  const [port] = ports;
  parentPort = port;
  port.start();

  await initializeModel(data.modelId);
});

function updateState(newState: WorkerState) {
  state = newState;
  parentPort?.postMessage({ type: "stateChange", state });
}

async function initializeModel(modelId: string) {
  try {
    const modelPath = await downloadModel(modelId);
    await loadModel(modelPath);

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

async function downloadModel(modelId: string): Promise<string> {
  updateState(WorkerState.Downloading);

  const modelPath: string = await modelDownload({
    uri: modelId,
    onProgress(status) {
      const progress = status.downloadedSize
        ? status.downloadedSize / status.totalSize
        : 0.0;
      parentPort?.postMessage({ type: "downloadProgress", progress });
    },
  })
    .then((modelPath: string) => {
      parentPort?.postMessage({ type: "downloadComplete" });
      return modelPath;
    })
    .catch((error) => {
      parentPort?.postMessage({
        type: "downloadError",
        error: error instanceof Error ? error.message : "Unknown error",
      });
      throw error;
    });

  return modelPath;
}

async function loadModel(modelPath: string) {
  updateState(WorkerState.Loading);

  const { getLlama, LlamaChatSession } = await import("node-llama-cpp");
  const llama = await getLlama({
    logger: (level, message) => {
      parentPort?.postMessage({ type: "log", level, message });
    },
    progressLogs: true,
    maxThreads: 4,
  });

  model = await llama.loadModel({
    modelPath,
    onLoadProgress: (progress) => {
      parentPort?.postMessage({ type: "loadProgress", progress });
    },
  });

  context = await model.createContext({ threads: 4 });
  session = new LlamaChatSession({ contextSequence: context.getSequence() });
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
        await initializeModel(message.modelId);
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
