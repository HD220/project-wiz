import { createQueue, createWorker } from "@/services/bullmq";
import { WorkerInputData, WorkerOutputData } from "./types";
import { processor } from "./processor";

export const installationQueue = createQueue<WorkerInputData, WorkerOutputData>(
  "installation-queue"
);
export const installationWorker = createWorker<
  WorkerInputData,
  WorkerOutputData
>("installation-queue", processor);
