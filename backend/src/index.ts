import * as dotenv from "dotenv";
dotenv.config();

import { installationWorker } from "./workers/installation";
import { connectRedis } from "./services/redis";
import { defaultBranchChangeWorker } from "./workers/branchChange";
import { analyseRepositoryWorker } from "./workers/analyseRepository";
import { analyseFileWorker } from "./workers/analyseFile";
import { chatCompletionWorker } from "./workers/chatCompletion";
import { createSimpleGit } from "./services/simple-git";
import { createTypescriptAnalyser } from "./services/anyliser/typescryptAnalyser";
import path from "node:path";
import { FileNode, GraphBuilder } from "./services/anyliser/GraphBuilder";
import { tokenize } from "./utils/generateModuleName";
import { generateDependencyGraph } from "./services/anyliser/ProjectAnalyser";
import { writeFileSync, writeSync } from "fs-extra";

type ResponseData = {
  data: {
    installations: {
      [id: string]: {
        id: number;
        repository_selection: string;
        created_at: Date;
        updated_at: Date;
      };
    };
    repositories: {
      [id: string]: {
        id: number;
        name: string;
        owner: string;
        is_batch_api: boolean;
      };
    };
  };
};

async function main() {
  // const redis = await connectRedis();
  // const data = (await redis.getItemsByKeyPattern(
  //   "user:*"
  // )) as unknown as ResponseData[];

  // const repositories = data
  //   .map((item: ResponseData) =>
  //     Object.entries(item.data.repositories).map(([, repo]) => ({ ...repo }))
  //   )
  //   .reduce((acc, cur) => [...acc, ...cur], []);

  // installationWorker.run();
  // defaultBranchChangeWorker.run();
  // analyseRepositoryWorker.run();
  // analyseFileWorker.run();
  // chatCompletionWorker.run();

  const project = path.resolve(
    process.cwd(),
    "data/repos",
    "197f5d11f98ea10d74b9be03de2dfe8b4f0c30ae/backend"
  );
  const extractor = await generateDependencyGraph(project);
  writeFileSync("teste.json", JSON.stringify(extractor, null, 2));
  // console.log(
  //   "extractor",
  //   extractor.map((e) => e.imports)
  // );
}

main();
