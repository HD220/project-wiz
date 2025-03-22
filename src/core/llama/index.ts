import { modelDownload } from "./download";

export async function test() {
  const { getLlama, LlamaChatSession } = await import("node-llama-cpp");
  const llama = await getLlama({
    logger: (level, message) => console.log(level, message),
    progressLogs: true,
    maxThreads: 4,
  });
  console.log("getting model...");
  const modelPath = await modelDownload(
    "https://huggingface.co/bartowski/gemma-2-2b-it-GGUF/resolve/main/gemma-2-2b-it-Q4_K_M.gguf"
  );
  console.log(modelPath);
  console.log("loading model");
  const model = await llama.loadModel({
    modelPath,

    onLoadProgress(loadProgress) {
      console.log(loadProgress);
    },
  });
  console.log("model loaded");
  console.log("creating context");
  const context = await model.createContext({
    threads: 4,
  });
  console.log("context created");

  const session = new LlamaChatSession({
    contextSequence: context.getSequence(),
  });

  const q1 = "Crie um texto de 5000 palavras sobre inteligencia atificial.";
  console.log("User: " + q1);

  const a1 = await session.prompt(q1, {
    // onResponseChunk(chunk) {
    //   console.log("chunk: ", chunk);
    // },
    // onToken(tokens) {
    //   console.log("tokens: ", tokens);
    // },
    onTextChunk(text) {
      console.log("text: ", text);
    },
  });
  console.log("AI: " + a1);
}
