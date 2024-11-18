import path from "node:path";
import fs from "node:fs";
import { simpleGit, CleanOptions, SimpleGitOptions } from "simple-git";
import { randomUUID } from "node:crypto";

const options: Partial<SimpleGitOptions> = {
  binary: "git",
  maxConcurrentProcesses: 6,
  trimmed: false,
};

export const createSimpleGit = async ({
  basePath = path.resolve(process.cwd(), "./data/repos"),
}: {
  basePath?: string;
}) => {
  const sg = simpleGit({ ...options });
  await sg.clean(CleanOptions.FORCE);

  async function getFilesDiff(commitHash: string, previousCommitHash: string) {
    await sg.cwd(path.resolve(basePath, commitHash));

    const diffSummary = await sg.diff([
      "--name-status",
      "-M",
      `${previousCommitHash}..${commitHash}`,
    ]);

    const lines = diffSummary.split("\n");

    const modifiedFiles: {
      filePath: string;
      status: "A" | "I" | "R" | "M";
    }[] = lines
      .map((line) => {
        const [status, filePath] = line.split("\t");
        return {
          status,
          filePath,
        } as {
          filePath: string;
          status: "A" | "I" | "R" | "M";
        };
      })
      .filter(({ filePath }) => Boolean(filePath));

    const tsFiles = modifiedFiles.filter(({ filePath }) => {
      return filePath.endsWith(".ts") || filePath.endsWith(".tsx");
    });

    const docFiles = modifiedFiles.filter(
      ({ filePath }) => filePath.endsWith(".md") || filePath.endsWith(".mdx")
    );

    return { tsFiles, docFiles };
  }

  async function clone(url: string) {
    try {
      const repositoriePath = path.resolve(basePath, randomUUID());

      if (fs.existsSync(repositoriePath))
        fs.rmSync(repositoriePath, { force: true, recursive: true });

      await sg.clone(url, repositoriePath);

      await sg.cwd(repositoriePath);
      const { latest } = await sg.log();

      const newPath = path.resolve(basePath, latest!.hash);

      if (fs.existsSync(newPath)) {
        fs.rmSync(newPath, { force: true, recursive: true });
      }
      fs.renameSync(repositoriePath, newPath);

      return latest!.hash;
    } catch (error) {
      console.error({ message: "simple-git", error });
      return "";
    }
  }

  async function pull(hash: string) {
    const from = path.resolve(basePath, hash);
    const to = path.resolve(basePath, randomUUID());

    fs.cpSync(from, to, { recursive: true });

    await sg.cwd(to);
    await sg.pull();

    const lastCommitHash = (await sg.log()).latest!.hash;
    if (fs.existsSync(path.resolve(basePath, lastCommitHash))) {
      fs.rmSync(to, { force: true, recursive: true });
    } else {
      fs.renameSync(to, path.resolve(basePath, lastCommitHash));
    }

    return lastCommitHash;
  }

  return {
    getFilesDiff,
    clone,
    firstCommit: await sg.firstCommit(),
    core: sg,
    pull,
  };
};
