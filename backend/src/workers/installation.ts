import { clone, createSimpleGit } from "@/services/simple-git";
import { createQueue, createWorker } from "../services/bull";
import { generateJWT } from "@/services/github";
import { analyseRepositoryQueue } from "./analyseRepository";

export const installationQueue = createQueue("installation");

export type InstallationWorkerData = {
  type: "installation" | "uninstallation";
  repositories: {
    name: string;
    owner: string;
  }[];
};

export const installationWorker = createWorker<InstallationWorkerData>(
  "installation",
  async (job) => {
    try {
      const { repositories, type } = job.data;

      switch (type) {
        case "installation": {
          const git = await createSimpleGit();
          const installationToken = generateJWT();

          for (const repo of repositories) {
            const commitHash = await clone(
              git,
              installationToken || "",
              `${repo.owner}/${repo.name}`
            );
            await analyseRepositoryQueue.add("repo-cloned", {
              commitHash: commitHash,
              name: repo.name,
              owner: repo.owner,
            });
          }
          break;
        }
        case "uninstallation": {
          break;
        }
        default: {
          break;
        }
      }
    } catch (error) {
      console.error({ error });
      throw error;
    }
  }
);
