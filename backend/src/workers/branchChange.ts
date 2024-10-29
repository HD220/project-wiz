import { createSimpleGit } from "@/services/simple-git";
import { createQueue, createWorker } from "../services/bull";
import { connectRedis } from "@/services/redis";
import fs from "node:fs";
import path from "node:path";
import { analyseRepositoryQueue } from "./analyseRepository";

/**
 * Esse worker copia o repositorio da versão anterior para nova, faz o pull e cria a job para analise
 */

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
      const versions = (await redis.json.get(`version:${owner}:${name}`, {
        path: "$",
      })) as {
        [commitHash: string]: {
          timestamp: number;
          status?: "analysing" | "analysed";
        };
      };

      const [lastVersion] = Object.entries(versions)
        .filter(([, value]) => value.status === "analysed")
        .map(([hash, value]) => ({
          hash,
          timetamp: value.timestamp,
        }))
        .sort((a, b) => a.timetamp - b.timetamp)
        .reverse();

      const git = await createSimpleGit();

      const from = path.resolve(
        process.cwd(),
        "./data/repos",
        lastVersion.hash
      );
      const to = path.resolve(process.cwd(), "./data/repos", name);
      fs.cpSync(from, to, { recursive: true });
      await git.cwd(to);
      await git.pull(); //atualiza repositorio copiado
      const log = await git.log(); //pega ultimo commit
      const lastCommitHash = log.latest?.hash || "";
      const newPath = path.resolve(
        process.cwd(),
        "./data/repos",
        lastCommitHash
      );
      await git.cwd(process.cwd()); //volta para pasta raiz par poder renomear o diretorio do repositorio
      fs.renameSync(from, newPath);

      await analyseRepositoryQueue.add("branch-updated", {
        name,
        owner,
        commitHash: lastCommitHash,
        previousCommitHash: lastVersion.hash,
      });
    } catch (error) {
      console.error({ error });
      // throw error;
    }
  }
);
