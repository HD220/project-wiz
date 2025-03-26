import {
  type LlamaOptions,
  type LlamaModelOptions,
  type LlamaContextOptions,
  type LlamaChatSessionOptions,
  type LLamaChatPromptOptions,
  type LlamaModel,
  type LlamaContext,
  type Llama,
} from "node-llama-cpp";
import { LlamaUtilityMessage } from "./types";
import path from "node:path";
import { fileURLToPath } from "node:url";

async function LlamaClient() {
  const { getLlama, LlamaChatSession, createModelDownloader } = await import(
    "node-llama-cpp"
  );

  const __dirname = path.dirname(fileURLToPath(import.meta.url));

  let llama: Llama | null = null;
  let model: LlamaModel | null = null;
  let chatSession: Omit<typeof LlamaChatSession, "prototype"> | null = null;

  const loadLlama = async (options?: LlamaOptions) => {
    try {
      llama = await getLlama(options);
    } catch (error) {
      console.error(error);
    }
  };

  const loadModel = async (
    uri: string,
    options?: Omit<LlamaModelOptions, "modelPath">
  ) => {
    try {
      const downloader = await createModelDownloader({
        modelUri: uri,
        dirPath: path.join(__dirname, "models"),
        onProgress: ({ downloadedSize, totalSize }) => {
          console.log("download", downloadedSize, totalSize);
        },
      });
      const modelPath = await downloader.download();
      model = await llama.loadModel({
        ...options,
        modelPath,
        onLoadProgress: (progress) => {
          console.log("progress", progress);
        },
      });
    } catch (error) {
      console.error(error);
    }
  };

  const createSession = async (
    contextOptions?: LlamaContextOptions,
    sessionOptions?: Omit<LlamaChatSessionOptions, "contextSequence">
  ) => {
    try {
      const context = await model.createContext(contextOptions);
      const session = new LlamaChatSession({
        ...sessionOptions,
        contextSequence: context.getSequence(),
      });
      chatSession = session;
    } catch (error) {
      console.error(error);
    }
  };

  process.parentPort.once("message", async (event) => {
    console.log("event", event);
    const { ports } = event;
    const [port] = ports;

    port.on("message", async (message) => {
      const data = message.data as LlamaUtilityMessage;

      switch (data.type) {
        case "init":
          await loadLlama(data.options);
          port.postMessage({ type: "init-response" } as LlamaUtilityMessage);
          console.log("llama-loaded");
          break;
        case "load-model":
          await loadModel(data.uri, data.options);
          console.log("model-loaded");
          break;
        case "create-session":
          await createSession(data.contextOptions, data.sessionOptions);
          console.log("session-created");
        default:
          break;
      }
    });

    port.start();
    port.postMessage({ type: "worker-loaded" } as LlamaUtilityMessage);
  });
}

LlamaClient();
