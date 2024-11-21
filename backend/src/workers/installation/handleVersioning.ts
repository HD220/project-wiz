import { ProcessorStep } from "@/services/bullmq/createProcessor";
import { WorkerInputData, WorkerOutputData } from "./types";
import { connectRedis } from "@/services/redis";

export const handleVersioning: ProcessorStep<
  WorkerInputData,
  WorkerOutputData
> = async (job, token, next) => {
  const { result: { repositories = [] } = {} } = job.data;

  // const redis = await connectRedis()

  // repositories.forEach((value)=>{
  //   redis.saveVersion({
  //     commitHash: value.commitHash,
  //     owner: value.owner,
  //     name: value.name
  //   })
  // })

  await next("completed"); //throw error signaling bullmq moveToDelay
};
