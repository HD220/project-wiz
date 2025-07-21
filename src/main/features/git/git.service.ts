import { randomUUID } from "crypto";
import { promises as fs } from "fs";
import { join, resolve } from "path";

import { simpleGit } from "simple-git";

import type {
  GitOperationResult,
  WorktreeInfo,
  GitInitOptions,
  GitCloneOptions,
  CommitOptions,
} from "@/main/features/git/git.types";

export class GitService {
  private static activeWorktrees = new Map<string, WorktreeInfo>();

  /**
   * Initialize a new Git repository
   */
  static async initializeRepository(
    options: GitInitOptions,
  ): Promise<GitOperationResult> {
    try {
      const { localPath, initialBranch = "main" } = options;

      // Ensure directory exists
      await fs.mkdir(localPath, { recursive: true });

      // Initialize git repository
      const git = simpleGit(localPath);
      await git.init(["--initial-branch", initialBranch]);

      // Create initial commit
      await this.createInitialCommit(localPath);

      return {
        success: true,
        output: `Repository initialized at ${localPath}`,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to initialize repository",
      };
    }
  }

  /**
   * Clone a repository from a remote URL
   */
  static async cloneRepository(
    options: GitCloneOptions,
  ): Promise<GitOperationResult> {
    try {
      const { gitUrl, localPath, branch, depth } = options;

      const git = simpleGit();

      const cloneOptions: string[] = [];
      if (branch) {
        cloneOptions.push("--branch", branch);
      }
      if (depth) {
        cloneOptions.push("--depth", depth.toString());
      }

      await git.clone(gitUrl, localPath, cloneOptions);

      return {
        success: true,
        output: `Repository cloned to ${localPath}`,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to clone repository",
      };
    }
  }

  /**
   * Create a worktree for agent task isolation
   */
  static async createWorktreeForTask(
    projectId: string,
    taskId: string,
    projectPath: string,
  ): Promise<WorktreeInfo | null> {
    try {
      const worktreeId = `task-${taskId}-${randomUUID().slice(0, 8)}`;
      const worktreePath = join(projectPath, ".worktrees", worktreeId);

      // Create worktree directory
      await fs.mkdir(join(projectPath, ".worktrees"), { recursive: true });

      // Create new worktree using simple-git
      const git = simpleGit(projectPath);
      await git.raw(["worktree", "add", worktreePath, "HEAD"]);

      const worktreeInfo: WorktreeInfo = {
        path: worktreePath,
        projectId,
        taskId,
        createdAt: new Date(),
      };

      this.activeWorktrees.set(worktreeId, worktreeInfo);

      return worktreeInfo;
    } catch (error) {
      console.error(`Failed to create worktree for task ${taskId}:`, error);
      return null;
    }
  }

  /**
   * Commit changes in a worktree
   */
  static async commitChanges(
    worktreePath: string,
    options: CommitOptions,
  ): Promise<GitOperationResult> {
    try {
      const git = simpleGit(worktreePath);

      // Stage all changes
      await git.add(".");

      // Check if there are changes to commit
      const status = await git.status();
      if (status.files.length === 0) {
        return {
          success: true,
          output: "No changes to commit",
        };
      }

      // Execute commit
      let result;
      if (options.author) {
        // Use raw command for author option
        result = await git.raw([
          "commit",
          "-m",
          options.message,
          "--author",
          `${options.author.name} <${options.author.email}>`,
        ]);
      } else {
        result = await git.commit(options.message);
      }

      return {
        success: true,
        output: `Committed: ${typeof result === "string" ? result : result.commit}`,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to commit changes",
      };
    }
  }

  /**
   * Clean up a worktree after task completion
   */
  static async cleanupWorktree(
    worktreePath: string,
  ): Promise<GitOperationResult> {
    try {
      // Find the project root by looking for worktree parent
      const projectPath = resolve(worktreePath, "../..");

      // Remove worktree using simple-git
      const git = simpleGit(projectPath);
      await git.raw(["worktree", "remove", worktreePath, "--force"]);

      // Remove from active worktrees map
      for (const [id, info] of this.activeWorktrees.entries()) {
        if (info.path === worktreePath) {
          this.activeWorktrees.delete(id);
          break;
        }
      }

      return {
        success: true,
        output: `Worktree ${worktreePath} cleaned up successfully`,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to cleanup worktree",
      };
    }
  }

  /**
   * Get repository status
   */
  static async getRepositoryStatus(
    repoPath: string,
  ): Promise<GitOperationResult> {
    try {
      const git = simpleGit(repoPath);
      const status = await git.status();

      const statusText = [
        ...status.files.map(
          (file) => `${file.index}${file.working_dir} ${file.path}`,
        ),
      ].join("\n");

      return {
        success: true,
        output: statusText,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to get repository status",
      };
    }
  }

  /**
   * Get active worktrees for a project
   */
  static getActiveWorktrees(projectId: string): WorktreeInfo[] {
    return Array.from(this.activeWorktrees.values()).filter(
      (info) => info.projectId === projectId,
    );
  }

  /**
   * Create initial commit for a new repository
   */
  private static async createInitialCommit(
    repoPath: string,
  ): Promise<GitOperationResult> {
    try {
      // Create .gitignore file
      const gitignoreContent = `# Project dependencies
node_modules/
dist/
build/

# Environment files
.env
.env.local
.env.*.local

# IDE files
.vscode/
.idea/
*.swp
*.swo

# OS files
.DS_Store
Thumbs.db

# Agent worktrees
.worktrees/
`;

      await fs.writeFile(join(repoPath, ".gitignore"), gitignoreContent);

      // Stage and commit using simple-git
      const git = simpleGit(repoPath);
      await git.add(".gitignore");
      const result = await git.commit("Initial commit");

      return {
        success: true,
        output: `Initial commit created: ${result.commit}`,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to create initial commit",
      };
    }
  }
}
