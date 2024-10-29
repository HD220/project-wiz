import { installationQueue, installationWorker } from "./workers/installation";
import { connectRedis, getItemsByKeyPattern } from "./services/redis";
import * as dotenv from "dotenv";
import { defaultBranchChangeWorker } from "./workers/branchChange";
import path from "node:path";
import fs from "node:fs";
import { analyseRepositoryWorker } from "./workers/analyseRepository";
import { generateGraphWorker } from "./workers/generateGraph";

dotenv.config();

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
  const data = (await getItemsByKeyPattern(
    redis,
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
  generateGraphWorker.run();
  await installationQueue.removeJobScheduler("tst");

  setTimeout(async () => {
    //remove pendentes
    await installationQueue.drain();

    //insere nova job
    await installationQueue.add(
      "teste",
      {
        repositories,
        type: "installation",
      },
      { jobId: "", removeOnComplete: true, removeOnFail: true }
    );
  }, 500);
}

main();
