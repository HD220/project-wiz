import * as dotenv from "dotenv";
dotenv.config();

import { installationQueue, installationWorker } from "./workers/installation";
import { connectRedis } from "./services/redis";
import { defaultBranchChangeWorker } from "./workers/branchChange";
import path from "node:path";
import fs from "node:fs";
import { analyseRepositoryWorker } from "./workers/analyseRepository";
import { analyseFileWorker } from "./workers/analyseFile";
import { chatCompletionWorker } from "./workers/chatCompletion";
import { createDependencyGraph } from "./services/anyliser/dependencyGraphBuilder";
import { createSimpleGit } from "./services/simple-git";
import { createTypescriptAnalyser } from "./services/anyliser/typescryptAnalyser";
import { FileNode, ModuleAnalyzer } from "./services/anyliser/moduleAnalyser";

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
  const workingDirectory = path.resolve(process.cwd(), "./data/repos");

  try {
    if (!fs.existsSync(workingDirectory)) {
      fs.mkdirSync(workingDirectory, { recursive: true });
    }
  } catch (error) {
    console.error(error);
  }

  const redis = await connectRedis();
  const data = (await redis.getItemsByKeyPattern(
    "user:*"
  )) as unknown as ResponseData[];

  const repositories = data
    .map((item: ResponseData) =>
      Object.entries(item.data.repositories).map(([, repo]) => ({ ...repo }))
    )
    .reduce((acc, cur) => [...acc, ...cur], []);

  installationWorker.run();
  defaultBranchChangeWorker.run();
  analyseRepositoryWorker.run();
  analyseFileWorker.run();
  chatCompletionWorker.run();
  // generateGraphWorker.run();
  // await installationQueue.removeJobScheduler("tst");

  // graph.addFileAnalysis()
  const git = await createSimpleGit({});
  const { tsFiles } = await git.getFilesDiff(
    "197f5d11f98ea10d74b9be03de2dfe8b4f0c30ae",
    git.firstCommit
  );
  // const graph = createDependencyGraph();

  const analysedFiles = tsFiles.map((file, idx) => {
    console.log("analisando", idx + 1, "de", tsFiles.length);

    const analyse = createTypescriptAnalyser(
      path.resolve(
        process.cwd(),
        "./data/repos",
        "197f5d11f98ea10d74b9be03de2dfe8b4f0c30ae"
      ),
      file.filePath
    ).analyze();

    return {
      filePath: file.filePath.replace(".ts", "").replace(".tsx", ""),
      imports: analyse.imports.map((imp) => imp.path),
    };
    // graph.addFileAnalysis(analyse);
  });
  // graph.buildGraph();
  // console.log("graph", graph.getGraphInfo());

  // Exemplo de uso:
  const analyzer = new ModuleAnalyzer();
  const files: FileNode[] = analysedFiles.map((file) => ({
    path: file.filePath,
    description: "",
    imports: file.imports,
  }));
  const moduleGroups = analyzer.analyzeModules(files);

  console.log("Módulos identificados:", moduleGroups);

  // setTimeout(async () => {
  //   //remove pendentes
  //   await installationQueue.drain();

  //   //insere nova job
  //   console.log("installation queued");
  //   await installationQueue.add(
  //     "new-installation",
  //     {
  //       repositories,
  //       type: "installation",
  //     },
  //     { removeOnComplete: true, removeOnFail: true }
  //   );
  // }, 500);
}

main();
