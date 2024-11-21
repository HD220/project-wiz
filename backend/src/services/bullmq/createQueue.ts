import { Queue } from "bullmq";
import { connection } from "./config";
import { WorkerInputBase } from "./types";

export const createQueue = <
  WorkerInputData extends WorkerInputBase = any,
  WorkerOutputData = any,
  Name extends string = string,
>(
  name: string
) => {
  const queue = new Queue<WorkerInputData, WorkerOutputData, Name>(name, {
    connection,
    defaultJobOptions: {
      removeOnComplete: true,
      removeOnFail: true,
    },
  });
  queue.on("error", (error) => {
    console.log(error);
  });

  return queue;
};
