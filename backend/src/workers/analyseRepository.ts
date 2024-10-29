import { connection, createQueue, createWorker } from "../services/bull";
import path from "node:path";
import { createSimpleGit } from "@/services/simple-git";
import { connectRedis } from "@/services/redis";
import { FlowProducer, WaitingChildrenError } from "bullmq";
import { buildAnalyseTree } from "../utils/buildAnalyseTree";
import { parse, visit, types, print } from "recast";
import { readFile } from "node:fs/promises";
import { readdirSync, readFileSync } from "node:fs";
import { generateGraphQueue, GenerateGraphWorkerData } from "./generateGraph";

const flowProducer = new FlowProducer({ connection });

async function getFilesDiff(commitHash: string, previousCommitHash?: string) {
  const git = await createSimpleGit();
  const workingDirectory = path.resolve(
    process.cwd(),
    "./data/repos",
    commitHash
  );
  await git.cwd(workingDirectory);
  const diffSummary = await git.diff([
    "--name-status",
    "-M",
    `${previousCommitHash || (await git.firstCommit())}..${commitHash}`,
  ]);
  // console.log("diffSummary", diffSummary);
  const lines = diffSummary.split("\n");
  // console.log("lines", lines);
  const modifiedFiles = lines
    .map((line) => {
      const [status, filePath] = line.split("\t");
      return {
        status,
        filePath,
      };
    })
    .filter(({ filePath }) => Boolean(filePath));
  // console.log("files", files);
  const tsFiles = modifiedFiles.filter(({ filePath }) => {
    return filePath.endsWith(".ts") || filePath.endsWith(".tsx");
  });
  // console.log("tsFiles", tsFiles);
  const docFiles = modifiedFiles.filter(
    ({ filePath }) => filePath.endsWith(".md") || filePath.endsWith(".mdx")
  );

  return { tsFiles, docFiles };
}

async function tsParser(code: string) {
  return parse(code, { parser: await import("recast/parsers/typescript") });
}

function findDependencies(
  node: any,
  dependencies: { path?: string; name: string }[],
  importMap: Record<string, string>
) {
  if (!node) return;

  if (node.type === "Identifier" && node.name) {
    const depPath = importMap[node.name];
    dependencies.push({ path: depPath, name: node.name });
  }

  if (node.type === "CallExpression" && node.callee && node.callee.name) {
    const depPath = importMap[node.callee.name];
    dependencies.push({ path: depPath, name: node.callee.name });
  }

  if (node.type === "TSTypeReference" && node.typeName && node.typeName.name) {
    const depPath = importMap[node.typeName.name];
    dependencies.push({ path: depPath, name: node.typeName.name });
  }

  if (node.body) {
    if (Array.isArray(node.body)) {
      node.body.forEach((child: any) =>
        findDependencies(child, dependencies, importMap)
      );
    } else {
      findDependencies(node.body, dependencies, importMap);
    }
  }
}

async function extractRootBlocks(source, filePath) {
  const ast = await tsParser(source);

  const importMap: Record<string, string> = {};

  const blocks: {
    name: string;
    source: string;
    dependencies?: { name: string; path: string }[];
  }[] = [];

  visit(ast, {
    visitImportDeclaration(path) {
      path.node.specifiers?.forEach((specifier) => {
        importMap[specifier.local?.name.toString() || ""] =
          path.node.source.value?.toString() || "";
      });

      this.traverse(path);
    },
  });

  // console.log("importMap", importMap);
  console.log("extracting ast from file", filePath);

  try {
    await visit(ast, {
      async visitDeclaration(path) {
        const node = path.node;

        if (types.namedTypes.FunctionDeclaration.check(node)) {
          const dependencies = [];
          findDependencies(node, dependencies, importMap);
          console.log("nodeName", node.id?.name);

          let code = "";
          try {
            code = print(node, {
              parser: await import("recast/parsers/typescript"),
            }).code;
          } catch (error) {
            console.error("tst", error);
          }

          blocks.push({
            name: node.id?.name.toString() || "",
            source: code,
            dependencies,
          });
        }

        return false;
      },
    });
  } catch (error) {
    console.log("vist", error);
  }
}

type AnalyseRepositoryWorkerData = {
  commitHash: string;
  previousCommitHash?: string;
  owner: string;
  name: string;
  step?: "pagerank-generate" | "diff-collect" | "wait-children" | "completed";
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
      const { commitHash, previousCommitHash, owner, name } = job.data;

      console.log("analyse-repository", job.data);

      const redis = await connectRedis();
      switch (job.data.step || "graph-generate") {
        case "graph-generate": {
          try {
            const diffFiles = await getFilesDiff(
              commitHash,
              previousCommitHash
            );
            // console.log("docFiles", docFiles);
            const workingDirectory = path.resolve(
              process.cwd(),
              "./data/repos",
              commitHash
            );
            const files = readdirSync(workingDirectory, {
              recursive: true,
              encoding: "utf-8",
            }).filter(
              (filePath) =>
                filePath.endsWith(".ts") || filePath.endsWith(".tsx")
            );

            const jobs = await Promise.all(
              files.map(async (filePath) => {
                const source = readFileSync(
                  path.resolve(workingDirectory, filePath),
                  {
                    encoding: "utf-8",
                  }
                );

                return {
                  filePath,
                  source,
                  rootBlocks: await extractRootBlocks(source, filePath),
                };
              })
            );

            console.log("jobs", jobs);

            // await generateGraphQueue.addBulk(jobs.map(data=>({data,name: 'generate-graph-file'+data.test, opts:{parent:{id: job.id!, queue: job.queueQualifiedName}}})))
            // throw new WaitingChildrenError()
          } catch (error) {
            console.error(error);
          }

          break;
        }
        case "diff-collect": {
          await redis.json.merge(`version:${owner}:${name}`, "$", {
            [commitHash]: {
              startedAt: Date.now(),
              status: "analysing",
              previousCommitHash: previousCommitHash || "",
            },
          });

          const repoPath = path.resolve(
            process.cwd(),
            "./data/repos",
            commitHash
          );
          console.log(repoPath);

          const git = await createSimpleGit();
          await git.cwd(repoPath);

          const firstCommit = (previousCommitHash ||
            (await git.log()).latest?.hash)!;

          const diff = await git.diff([
            "--name-status -M",
            `${firstCommit}..${commitHash}`,
          ]);

          const files = diff
            .split("\n")
            .map((line) => {
              const [status, path] = line.split(" ");
              return {
                status,
                path,
              };
            })
            .filter(
              //filtra por arquivos relevantes para analise (typescript, jsx/tsx, README)
              ({ path: file }) =>
                file.endsWith(".ts") ||
                file.endsWith(".tsx") ||
                file.endsWith("README.md")
            );

          //montar grafo de paths e arquivos para gerar jobs filhas das filhas, etc.
          //depois deve ser convertido para utilizar o pagerank
          const tree = buildAnalyseTree(files);

          const jobNode = await flowProducer.add(tree);

          await job.updateData({
            ...job.data,
            step: "wait-children",
            child: {
              id: jobNode.job.id!,
              queue: jobNode.job.queueQualifiedName,
            },
          });
          await job.moveToWaitingChildren(token || "", {
            child: {
              id: jobNode.job.id!,
              queue: jobNode.job.queueQualifiedName,
            },
          });
          throw new WaitingChildrenError();
        }
        case "wait-children": {
          const child = job.data.child!;
          const shouldWait = await job.moveToWaitingChildren(token || "", {
            child,
          });
          if (shouldWait) throw new WaitingChildrenError();
          await redis.json.merge(`version:${owner}:${name}`, "$", {
            [commitHash]: {
              finalizedAt: Date.now(),
              status: "analyseRepository",
            },
          });
          await job.updateData({ ...job.data, step: "completed" });

          break;
        }
        default:
          break;
      }
    }
  );
