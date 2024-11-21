import simpleGit, { CleanOptions } from "simple-git";
import { GitDiffEntry } from "./types";

export const createGit = async (repoPath: string) => {
  const git = simpleGit(repoPath);
  await git.clean(CleanOptions.FORCE);

  async function diff(firstCommitHash: string, lastCommitHash: string) {
    const diffOutput = await git.diff([
      "--name-status",
      "-M",
      `${firstCommitHash}..${lastCommitHash}`,
    ]);

    const diffSummary = diffOutput
      .split("\n")
      .filter((line) => line.trim())
      .map((line) => {
        const [status, path] = line.split("\t");
        const similarity = parseInt(status.slice(1) || "100");

        return {
          status: status[0],
          similarity,
          path: ["R", "C"].includes(status[0]) ? path.split(" -> ")[1] : path,
          from: ["R", "C"].includes(status[0])
            ? path.split(" -> ")[0]
            : undefined,
        } as GitDiffEntry;
      });

    return diffSummary;
  }

  async function listFiles() {
    await git.cwd(repoPath);
    try {
      const files = await git.raw(["ls-files"]);
      return files
        .split("\n")
        .filter((line) => line.trim())
        .map((line) => {
          return {
            path: line,
            status: "A",
            similarity: 100,
          } as GitDiffEntry;
        });
    } catch (error) {
      console.error("Erro ao listar arquivos:", error);
      return [];
    }
  }

  return {
    listFiles,
    diff,
  };
};
