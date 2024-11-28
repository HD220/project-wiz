import { Queue } from "bullmq";
import { connection } from "./config";

export const createQueue = <
  WorkerInputData = any,
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
