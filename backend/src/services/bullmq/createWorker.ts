import { Worker, Processor } from "bullmq";
import { connection } from "./config";

export const createWorker = <WorkerData, WorkerReturn = unknown>(
  queue: string,
  processor: Processor<WorkerData, WorkerReturn>
) => {
  const worker = new Worker<WorkerData, WorkerReturn>(queue, processor, {
    connection,
    lockDuration: 1000 * 60 * 5,
    autorun: false,
  });

  worker.on("error", (error) => {
    console.error(error);
  });

  return worker;
};
