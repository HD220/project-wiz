import { ProcessorStep } from "@/services/bullmq/createProcessor";
import { WorkerInputData, WorkerOutputData } from "./types";
import { generateJWT } from "@/services/github";
import { createSimpleGit } from "@/services/simple-git";
import path from "node:path";

export const handleCloning: ProcessorStep<
  WorkerInputData,
  WorkerOutputData
> = async (job, token, next) => {
  const { repositories } = job.data;
  const appToken = generateJWT();

  const clonedRepos = await Promise.all(
    repositories.map(async ({ name, owner }) => {
      const git = await createSimpleGit(path.resolve(process.cwd(), "tmp"));

      const repoUrl = `https://x-access-token:${appToken}@github.com/${owner}/${name}.git`;
      const commitHash = await git.cloneRepository(repoUrl);

      return {
        commitHash: commitHash,
        name,
        owner,
      };
    })
  );

  await job.updateData({ ...job.data, result: { repositories: clonedRepos } });

  await next("collecting"); //throw error signaling bullmq moveToDelay
};
