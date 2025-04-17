import {
  RepositoryInfo,
  StatusInfo,
  CommitParams,
  PullPushParams,
  BranchParams,
  BranchInfo,
  CommitInfo,
} from "../../shared/types/git";

/**
 * Interface defining all Git operations following Ports & Adapters pattern.
 * 
 * This is the main contract that all Git service implementations must follow.
 * 
 * @see ADR-0030 for architectural decisions
 */
export interface IGitService {
  addRepository(localPath: string, remoteUrl: string, credentialsId?: string): Promise<RepositoryInfo>;
  listRepositories(): Promise<RepositoryInfo[]>;
  getStatus(repositoryId: string): Promise<StatusInfo>;
  commitChanges(params: CommitParams): Promise<void>;
  pushChanges(params: PullPushParams): Promise<void>;
  pullChanges(params: PullPushParams): Promise<void>;
  createBranch(params: BranchParams): Promise<void>;
  switchBranch(params: BranchParams): Promise<void>;
  deleteBranch(params: BranchParams): Promise<void>;
  listBranches(repositoryId: string): Promise<BranchInfo[]>;
  getHistory(repositoryId: string, branchName?: string): Promise<CommitInfo[]>;
  syncWithRemote(repositoryId: string, credentialsId?: string): Promise<void>;
}