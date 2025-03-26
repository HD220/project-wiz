import { parentPort } from "node:worker_threads";
import LlamaWorkerFactory from "./LlamaWorkerFactory";
import { WorkerType } from "./types";

let workers = new Map<WorkerType, any>();

parentPort.on("message", async (message) => {
  const { type, ...data } = message;

  if (type === "init") {
    // Inicializa os workers necessários
    const chatWorker = LlamaWorkerFactory.createWorker("chat");
    await chatWorker.initialize();
    workers.set("chat", chatWorker);

    const analysisWorker = LlamaWorkerFactory.createWorker("analysis");
    await analysisWorker.initialize();
    workers.set("analysis", analysisWorker);

    parentPort.postMessage({ type: "init-response" });
    return;
  }

  // Processa mensagens normais
  const worker = workers.get(type as WorkerType);
  if (!worker) {
    parentPort.postMessage({
      type: "error",
      message: `Worker ${type} not found`,
    });
    return;
  }

  try {
    const response = await worker.processMessage(data);
    parentPort.postMessage({
      type: "response",
      data: response,
    });
  } catch (error) {
    parentPort.postMessage({
      type: "error",
      message: error.message,
    });
  }
});
