import { createSimpleGit } from "@/services/simple-git";
import { createQueue, createWorker } from "../services/bullmq";
import { connectRedis } from "@/services/redis";
import { analyseRepositoryQueue } from "./analyseRepository";

export type BranchChangeWorkerData = {
  repo: {
    name: string;
    owner: string;
  };
};

export const defaultBranchChangeQueue =
  createQueue<BranchChangeWorkerData>("branch-change");
export const defaultBranchChangeWorker = createWorker<BranchChangeWorkerData>(
  "branch-change",
  async (job) => {
    try {
      const { name, owner } = job.data.repo;

      const redis = await connectRedis();
      const lastCommitHash = await redis.getLastVersion(owner, name);

      const git = await createSimpleGit({});
      const commitHash = await git.pull(lastCommitHash);

      await analyseRepositoryQueue.add("branch-updated", {
        name,
        owner,
        commitHash,
        previousCommitHash: lastCommitHash,
      });
    } catch (error) {
      console.error({ error });
      // throw error;
    }
  }
);
