import { runShellCommand } from "@/main/kernel/shell.service";
import logger from "@/main/logger";
import path from "path";
import fs from "fs/promises";

export class GitWorktreeService {
  constructor(private readonly projectRoot: string) {}

  private async executeGitCommand(
    args: string[],
    cwd: string,
  ): Promise<string> {
    const { stdout, stderr, exitCode } = await runShellCommand(
      "git",
      args,
      cwd,
    );

    if (exitCode !== 0) {
      logger.error(`Git command failed: ${args.join(" ")}`, { stdout, stderr });
      throw new Error(`Git command failed: ${stderr || stdout}`);
    }
    return stdout;
  }

  async createWorktree(
    worktreeName: string,
    baseBranch: string = "main",
  ): Promise<string> {
    const worktreePath = path.join(this.projectRoot, ".worktrees", worktreeName);
    logger.info(`Creating git worktree at ${worktreePath} from ${baseBranch}`);

    // Ensure the .worktrees directory exists
    await fs.mkdir(path.join(this.projectRoot, ".worktrees"), { recursive: true });

    await this.executeGitCommand(
      ["worktree", "add", "-b", worktreeName, worktreePath, baseBranch],
      this.projectRoot,
    );

    logger.info(`Worktree ${worktreeName} created successfully.`);
    return worktreePath;
  }

  async removeWorktree(worktreeName: string): Promise<void> {
    const worktreePath = path.join(this.projectRoot, ".worktrees", worktreeName);
    logger.info(`Removing git worktree at ${worktreePath}`);

    // Force remove the worktree
    await this.executeGitCommand(
      ["worktree", "remove", worktreePath, "--force"],
      this.projectRoot,
    );

    // Clean up the actual directory if it still exists
    try {
      await fs.rm(worktreePath, { recursive: true, force: true });
      logger.info(`Worktree directory ${worktreePath} removed.`);
    } catch (error) {
      logger.warn(`Failed to remove worktree directory ${worktreePath}: ${error.message}`);
    }

    logger.info(`Worktree ${worktreeName} removed successfully.`);
  }

  async listWorktrees(): Promise<string[]> {
    logger.info("Listing git worktrees");
    const output = await this.executeGitCommand(
      ["worktree", "list", "--porcelain"],
      this.projectRoot,
    );
    return output
      .split("\n\n")
      .filter((entry) => entry.startsWith("worktree "))
      .map((entry) => entry.split("\n")[0].replace("worktree ", ""));
  }

  async getCurrentBranch(worktreePath: string): Promise<string> {
    logger.info(`Getting current branch for worktree: ${worktreePath}`);
    const output = await this.executeGitCommand(
      ["rev-parse", "--abbrev-ref", "HEAD"],
      worktreePath,
    );
    return output.trim();
  }

  async checkoutBranch(worktreePath: string, branchName: string): Promise<void> {
    logger.info(`Checking out branch ${branchName} in worktree: ${worktreePath}`);
    await this.executeGitCommand(["checkout", branchName], worktreePath);
  }

  async addAndCommit(
    worktreePath: string,
    message: string,
    files: string[] = ["."],
  ): Promise<void> {
    logger.info(`Adding and committing changes in worktree: ${worktreePath}`);
    await this.executeGitCommand(["add", ...files], worktreePath);
    await this.executeGitCommand(["commit", "-m", message], worktreePath);
    logger.info(`Changes committed in ${worktreePath} with message: ${message}`);
  }

  async mergeBranch(
    worktreePath: string,
    branchToMerge: string,
    targetBranch: string = "main",
  ): Promise<void> {
    logger.info(
      `Merging branch ${branchToMerge} into ${targetBranch} in worktree: ${worktreePath}`,
    );
    await this.checkoutBranch(worktreePath, targetBranch);
    await this.executeGitCommand(["merge", branchToMerge], worktreePath);
    logger.info(
      `Branch ${branchToMerge} merged into ${targetBranch} in ${worktreePath}`,
    );
  }
}