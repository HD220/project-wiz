import { ConnectionOptions, Job, Queue, Worker } from "bullmq";

export const connection: ConnectionOptions = {
  host: "localhost",
  port: 6379,
};

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

export const createWorker = <WorkerData, WorkerReturn = unknown>(
  queue: string,
  processor: (
    job: Job<WorkerData, WorkerReturn>,
    token?: string
  ) => Promise<WorkerReturn>
) => {
  const worker = new Worker<WorkerData, WorkerReturn>(queue, processor, {
    connection,
    removeOnComplete: { count: 0, age: 0 },
    removeOnFail: { count: 0, age: 0 },
    autorun: false,
  });

  worker.on("error", (error) => {
    console.error(error);
  });

  return worker;
};
