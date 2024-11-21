import path from "node:path";
import fs from "node:fs";
import { simpleGit, CleanOptions, SimpleGitOptions } from "simple-git";
import { randomUUID } from "node:crypto";

const DEFAULT_OPTIONS: Partial<SimpleGitOptions> = {
  binary: "git",
  maxConcurrentProcesses: 6,
  trimmed: false,
};

export const createSimpleGit = async ({
  basePath = path.resolve(process.cwd(), "./data/repos"),
}: {
  basePath?: string;
}) => {
  const sg = simpleGit({ ...DEFAULT_OPTIONS });
  await sg.clean(CleanOptions.FORCE);

  const resolveRepoPath = (hash: string) => path.resolve(basePath, hash);

  const deletePathIfExists = (dir: string) => {
    if (fs.existsSync(dir)) {
      fs.rmSync(dir, { force: true, recursive: true });
    }
  };

  const moveRepo = (source: string, destination: string) => {
    deletePathIfExists(destination);
    fs.renameSync(source, destination);
  };

  async function getFilesDiff(commitHash: string, previousCommitHash: string) {
    const repoPath = resolveRepoPath(commitHash);
    await sg.cwd(repoPath);

    const diffSummary = await sg.diff([
      "--name-status",
      "-M",
      `${previousCommitHash}..${commitHash}`,
    ]);

    const lines = diffSummary.split("\n");

    const modifiedFiles = lines
      .map((line) => {
        const [status, filePath] = line.split("\t");
        return { status, filePath } as {
          filePath: string;
          status: "A" | "I" | "R" | "M";
        };
      })
      .filter(({ filePath }) => Boolean(filePath));

    const filterFilesByExtensions = (extensions: string[]) =>
      modifiedFiles.filter(({ filePath }) =>
        extensions.some((ext) => filePath.endsWith(ext))
      );

    return {
      tsFiles: filterFilesByExtensions([".ts", ".tsx"]),
      docFiles: filterFilesByExtensions([".md", ".mdx"]),
    };
  }

  async function clone(url: string) {
    try {
      const tempRepoPath = path.resolve(basePath, randomUUID());

      deletePathIfExists(tempRepoPath);
      await sg.clone(url, tempRepoPath);

      await sg.cwd(tempRepoPath);
      const { latest } = await sg.log();

      if (!latest) throw new Error("No commits found in repository");

      const finalRepoPath = resolveRepoPath(latest.hash);
      moveRepo(tempRepoPath, finalRepoPath);

      return latest.hash;
    } catch (error) {
      console.error({ message: "simple-git", error });
      return "";
    }
  }

  async function pull(hash: string) {
    const sourcePath = resolveRepoPath(hash);
    const tempRepoPath = path.resolve(basePath, randomUUID());

    fs.cpSync(sourcePath, tempRepoPath, { recursive: true });
    await sg.cwd(tempRepoPath);
    await sg.pull();

    const { latest } = await sg.log();
    if (!latest) throw new Error("Failed to retrieve the latest commit hash");

    const finalRepoPath = resolveRepoPath(latest.hash);

    if (fs.existsSync(finalRepoPath)) {
      deletePathIfExists(tempRepoPath);
    } else {
      moveRepo(tempRepoPath, finalRepoPath);
    }

    return latest.hash;
  }

  const firstCommitHash = await sg.firstCommit();

  return {
    getFilesDiff,
    clone,
    pull,
    firstCommit: firstCommitHash,
    core: sg,
  };
};
