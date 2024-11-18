import { createSimpleGit } from "@/services/simple-git";
import { createQueue, createWorker } from "@/services/bullmq";
import { generateJWT } from "@/services/github";
import { analyseRepositoryQueue } from "./analyseRepository";
import { DelayedError, WaitingChildrenError } from "bullmq";

export const installationQueue = createQueue("installation");

export type InstallationWorkerData = {
  type: "installation" | "uninstallation";
  step?: "validating" | "in_progress" | "finalizing" | "completed";
  repositories: {
    name: string;
    owner: string;
  }[];
};

export const installationWorker = createWorker<InstallationWorkerData>(
  "installation",
  async (job, token) => {
    try {
      const { repositories, type, step = "validating" } = job.data;

      switch (type) {
        case "installation": {
          switch (step) {
            case "validating": {
              const git = await createSimpleGit({});
              const installationToken = generateJWT();

              for (const repo of repositories) {
                const repoUrl = `https://x-access-token:${installationToken}@github.com/${repo.owner}/${repo.name}.git`;

                const commitHash = await git.clone(repoUrl);

                console.log("analyse-repo-cloned");
                await analyseRepositoryQueue.add(
                  "repo-cloned",
                  {
                    commitHash: commitHash,
                    name: repo.name,
                    owner: repo.owner,
                  },
                  {
                    parent: {
                      id: job.id!,
                      queue: job.queueQualifiedName,
                    },
                  }
                );
              }

              await job.updateData({ ...job.data, step: "in_progress" });
              await job.moveToDelayed(Date.now() + 100, token);
              throw new DelayedError();
            }
            case "in_progress": {
              const shouldWait = await job.moveToWaitingChildren(token!);
              if (shouldWait) throw new WaitingChildrenError();

              await job.updateData({ ...job.data, step: "completed" });
              await job.moveToDelayed(Date.now() + 100, token);
              throw new DelayedError();
            }
            default: {
              console.log("installation completed!");
              break;
            }
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
