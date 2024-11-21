import { ProcessorStep } from "@/services/bullmq/createProcessor";
import { WorkerInputData, WorkerOutputData } from "./types";

export const handleCompleted: ProcessorStep<
  WorkerInputData,
  WorkerOutputData
> = async (job) => {
  const { result: { repositories = [] } = {} } = job.data;

  return { repositories };
};
