import { ProcessorStep } from "@/services/bullmq/createProcessor";
import { WorkerInputData, WorkerOutputData } from "./types";
import { connectRedis } from "@/services/redis";
import path from "node:path";
import { createGit } from "@/services/git/createGit";
import { GitDiffEntry } from "@/services/git/types";

export const handleReadFiles: ProcessorStep<
  WorkerInputData,
  WorkerOutputData
> = async (job, token, next) => {
  const { commitHash: currentCommitHash, name, owner } = job.data;

  const redis = await connectRedis();
  const previousCommitHash = await redis.getLastVersion(owner, name);
  const git = await createGit(
    path.resolve(process.cwd(), "tmp", currentCommitHash)
  );

  const allFiles = await git.listFiles();

  const filesToAnalyse = previousCommitHash
    ? await git.diff(previousCommitHash, currentCommitHash)
    : allFiles;

  const codeFiles = {
    all: allFiles.filter(isCodeFile),
    toAnalyse: filesToAnalyse.filter(isCodeFile),
  };

  // codeFiles.all -> send generate-groups
  // codeFiles.toAnalyse -> send collect descriptions
  const allFiles = [
    {
      path: "backend/src/index.ts",
      blocks: {
        "22b11fc1becaab2b702e47aad30e99c4fba4b767": {
          name: "main",
          export: "main",
          dependencies: [
            {
              name: "installationQueue",
              path: "backend/src/workers/installation",
            },
          ],
        },
      },
    },
    {
      path: "backend/src/workers/installation/index.ts",
      bloks: {
        "22b11fc1becaab2b702e47aad30e99c4fba4b767": {
          name: "installationQueue",
          export: "installationQueue",
          dependencies: [],
        },
      },
    },
  ];

  const modifiedBlocks = [
    {
      name: "main",
      path: "backend/src/index.ts",
      dependencies: [
        {
          name: "installationQueue",
          path: "backend/src/workers/installation/index.ts",
        },
      ],
    },
  ];

  const groups = [
    {
      name: "MainInstallationQueueModule",
      blocks: [
        { name: "main", file: "backend/src/index.ts" },
        {
          name: "installationQueue",
          path: "backend/src/workers/installation/index.ts",
        },
      ],
      centralFile: "backend/src/index.ts",
    },
  ];

  const groupToAnalyse: typeof groups = [];

  groups.forEach((group) => {
    const modifiedFiles = group.blocks.filter((file) =>
      codeFiles.toAnalyse.some((modFile) => modFile.path === file)
    );
    if (modifiedFiles.length > 0) groupToAnalyse.push(group);
  });

  // send group To Analyse

  //

  await next("extract-blocks"); //throw error signaling bullmq moveToDelay
};

function isCodeFile(file: GitDiffEntry) {
  const codeExtensions = [".js", ".jsx", ".ts", ".tsx"];
  return codeExtensions.some((ext) => file.path.endsWith(ext));
}
