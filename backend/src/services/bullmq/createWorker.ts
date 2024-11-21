import { Worker, Processor } from "bullmq";
import { connection } from "./config";
import { WorkerInputBase } from "./types";

export const createWorker = <
  WorkerInputData extends WorkerInputBase = any,
  WorkerOutputData = any,
  Name extends string = string,
>(
  queue: string,
  processor: Processor<WorkerInputData, WorkerOutputData, Name>
) => {
  const worker = new Worker<WorkerInputData, WorkerOutputData, Name>(
    queue,
    processor,
    {
      connection,
      lockDuration: 1000 * 60 * 5,
      autorun: false,
    }
  );

  worker.on("error", (error) => {
    console.error(error);
  });

  return worker;
};
