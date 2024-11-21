import { ProcessorStep } from "@/services/bullmq/createProcessor";
import { WorkerInputData, WorkerOutputData } from "./types";
import path from "path";

export const handleExtractBlocks: ProcessorStep<
  WorkerInputData,
  WorkerOutputData
> = async (job, token, next) => {
  const { commitHash, previousCommitHash } = job.data;
  const basePath = path.resolve(process.cwd(), "tmp", commitHash);

  await next("collecting"); //throw error signaling bullmq moveToDelay
};
