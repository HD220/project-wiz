import { Queue } from "bullmq";
import { connection } from "./config";

export const createQueue = <WorkerData, WorkerReturn = unknown>(
  name: string
) => {
  const queue = new Queue<WorkerData, WorkerReturn>(name, {
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
