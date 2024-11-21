import { createQueue, createWorker } from "@/services/bullmq";
import { WorkerInputData, WorkerOutputData } from "./types";
import { processor } from "./processor";

export const analyseRepositoryQueue = createQueue<
  WorkerInputData,
  WorkerOutputData
>("analyse-repository");
export const analyseRepositoryWorker = createWorker<
  WorkerInputData,
  WorkerOutputData
>("analyse-repository", processor);
