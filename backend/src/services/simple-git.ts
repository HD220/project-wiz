import path from "node:path";
import fs from "node:fs";
import {
  simpleGit,
  SimpleGit,
  CleanOptions,
  SimpleGitOptions,
} from "simple-git";

const options: Partial<SimpleGitOptions> = {
  baseDir: path.resolve(process.cwd(), "./data/repos"),
  binary: "git",
  maxConcurrentProcesses: 6,
  trimmed: false,
};

export const createSimpleGit = async () => {
  const sg = simpleGit({ ...options });
  await sg.clean(CleanOptions.FORCE);

  return sg;
};

export async function clone(
  simpleGit: SimpleGit,
  installationToken: string,
  full_name: string
) {
  try {
    const [owner, repo] = full_name.split("/");

    const repoUrl = `https://x-access-token:${installationToken}@github.com/${owner}/${repo}.git`;

    const filePath = path.resolve(process.cwd(), "./data/repos", repo);

    if (fs.existsSync(filePath))
      fs.rmSync(filePath, { force: true, recursive: true });

    await simpleGit.clone(repoUrl, filePath);

    await simpleGit.cwd(filePath);
    const { latest } = await simpleGit.log();

    await simpleGit.cwd(process.cwd());

    const newPath = path.resolve(process.cwd(), "./data/repos", latest!.hash);
    if (fs.existsSync(newPath)) {
      fs.rmSync(newPath, { force: true, recursive: true });
    }
    fs.renameSync(filePath, newPath);

    return latest!.hash;
  } catch (error) {
    console.error({ message: "simple-git", error });
    return "";
  }
}
