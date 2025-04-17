import { GitUseCases } from "@/application/useCases/GitUseCases";
import { ElectronGitService } from "@/infrastructure/ElectronGitService";

// Create the infrastructure adapter
const gitAdapter = new ElectronGitService();

// Create the application layer with injected adapter
export const gitService = new GitUseCases(gitAdapter);

// Export individual use cases for convenience
export const {
  addRepository,
  listRepositories,
  getStatus,
  commitChanges,
  pushChanges,
  pullChanges,
  createBranch,
  switchBranch,
  deleteBranch,
  listBranches,
  getHistory,
  syncWithRemote,
} = gitService;