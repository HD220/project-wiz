import { createQueue, createWorker } from "../services/bullmq";
import path from "node:path";
import { createSimpleGit } from "@/services/simple-git";
import { DelayedError, WaitingChildrenError } from "bullmq";
import { createTypescriptAnalyser } from "@/services/analyzer/typescryptAnalyser";
import { analyseFileQueue } from "./analyseFile";

type AnalyseRepositoryWorkerData = {
  commitHash: string;
  previousCommitHash?: string;
  owner: string;
  name: string;
  step?: "initial" | "description-collect" | "wait-children" | "completed";
  child?: {
    id: string;
    queue: string;
  };
};

export const analyseRepositoryQueue =
  createQueue<AnalyseRepositoryWorkerData>("analyse-repository");

export const analyseRepositoryWorker =
  createWorker<AnalyseRepositoryWorkerData>(
    "analyse-repository",
    async (job, token) => {
      const { commitHash, previousCommitHash } = job.data;
      if (!commitHash) return;

      const workingDirectory = path.resolve(
        process.cwd(),
        "./data/repos",
        commitHash
      );

      const git = await createSimpleGit({});

      switch (job.data.step || "initial") {
        case "initial": {
          console.log(job.name, " starting with data ", job.data);
          const { tsFiles } = await git.getFilesDiff(
            commitHash,
            previousCommitHash || git.firstCommit
          );

          console.log(job.name, " analysing ", tsFiles.length, " files");
          const blocks = tsFiles.map((data) => {
            const analyse = {
              ...data,
              analyse: createTypescriptAnalyser(
                workingDirectory,
                data.filePath
              ).analyze(),
            };
            return analyse;
          });
          console.log(
            job.name,
            " extracted ",
            blocks.reduce((acc, file) => acc + file.analyse.blocks.length, 0),
            " blocks"
          );

          //cria jobs filhas para criação das descrições com a IA e aguarda conclusão
          await analyseFileQueue.addBulk(
            blocks.map((block) => {
              return {
                name: `${path.basename(block.filePath)}`,
                data: {
                  commitHash,
                  previousCommitHash: previousCommitHash || git.firstCommit,
                  fileAnalysis: { ...block.analyse },
                  filePath: block.filePath,
                  status: block.status,
                },
                opts: {
                  parent: {
                    id: job.id!,
                    queue: job.queueQualifiedName,
                  },
                },
              };
            })
          );

          await job.updateData({ ...job.data, step: "description-collect" });
          await job.moveToDelayed(Date.now() + 10, token);
          throw new DelayedError();
        }
        case "description-collect": {
          console.log(job.name, "wait children");
          const shoudWait = await job.moveToWaitingChildren(token!);
          if (shoudWait) throw new WaitingChildrenError();
          await job.updateData({ ...job.data, step: "completed" });

          console.log("descrições coletadas");
          await job.moveToDelayed(Date.now() + 10, token!);
          throw new DelayedError();
        }
        default:
          console.log(job.name, "analyseRepository completed!");
          break;
      }
      return;
    }
  );
