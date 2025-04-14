import { IGitService } from "../../core/application/git/igit-service";
import { ElectronGitService } from "../../core/infrastructure/git/electron-git-service";

/**
 * Dependency injection entry point for GitService.
 * By default, exports the ElectronGitService implementation.
 * All contracts are defined in src/shared/types/git.ts.
 */
export const gitService: IGitService = new ElectronGitService();