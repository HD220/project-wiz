import * as dotenv from "dotenv";
dotenv.config();

import path from "node:path";
import { writeFileSync } from "fs-extra";
import { TypescriptRepositoryMapper } from "./services/analyzer/TypescriptRepositoryMapper";
import { ModuleDetection } from "./services/analyzer/ModuleDetection";

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
    "197f5d11f98ea10d74b9be03de2dfe8b4f0c30ae"
    // "milli-platform"
    // "natural"
  );
  const repoMapper = new TypescriptRepositoryMapper();
  const extracted = await repoMapper.loadRepository(project);

  writeFileSync(`teste.json`, JSON.stringify(extracted, null, 2));

  // const detection = new ModuleDetection(
  //   extracted
  //     .map((ext) => ext.analyze)
  //     .reduce((acc, cur) => [...acc, ...cur], [])
  // );
  // const modules = detection.buildModuleHierarchy();
  // console.log("general modules", modules.length);

  // writeFileSync(`modules_by_resolution.json`, JSON.stringify(modules, null, 2));
}

main();
