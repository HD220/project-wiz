import { LlamaWorker } from "./worker.js";

const worker = LlamaWorker.create();

process.parentPort.once("message", (message) => {
  const [port] = message.ports;
});
