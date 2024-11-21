import { ProcessorStep } from "@/services/bullmq/createProcessor";
import { WorkerInputData, WorkerOutputData } from "./types";
import { analyseRepositoryQueue } from "@/workers/analyseRepository/index";

export const handleCollecting: ProcessorStep<
  WorkerInputData,
  WorkerOutputData
> = async (job, token, next) => {
  const { result: { repositories = [] } = {} } = job.data;

  if (repositories.length > 0)
    await analyseRepositoryQueue.addBulk(
      repositories?.map((repo) => ({
        name: `analyse-${repo.owner}-${repo.name}`,
        data: { commitHash: repo.commitHash },
        opts: {
          jobId: `analyse-${repo.owner}-${repo.name}`, //para adicionar apenas uma analise por vez
          attempts: 5,
          backoff: {
            type: "exponential",
            delay: 30 * 1000,
          },
          failParentOnFailure: false,
          removeOnComplete: true,
          removeOnFail: true,
        },
      }))
    );

  await next("versioning"); //throw error signaling bullmq moveToDelay
};
