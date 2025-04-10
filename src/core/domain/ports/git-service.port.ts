export interface RepositoryInfo {
  id: string;
  name: string;
  localPath: string;
  remoteUrl: string;
  currentBranch: string;
}

export interface BranchInfo {
  name: string;
  isCurrent: boolean;
  isRemote: boolean;
}

export interface CommitInfo {
  hash: string;
  author: string;
  date: string;
  message: string;
}

export interface StatusInfo {
  modified: string[];
  staged: string[];
  untracked: string[];
  conflicted: string[];
}

export interface CloneRepositoryParams {
  remoteUrl: string;
  localPath: string;
  credentialsId?: string;
}

export interface CommitParams {
  repositoryId: string;
  message: string;
  files?: string[];
}

export interface PullPushParams {
  repositoryId: string;
  remoteName?: string;
  branchName?: string;
  credentialsId?: string;
}

export interface BranchParams {
  repositoryId: string;
  branchName: string;
  sourceBranch?: string;
}

export interface IGitServicePort {
  addRepository(localPath: string, remoteUrl: string, credentialsId?: string): Promise<RepositoryInfo>;
  removeRepository(repositoryId: string): Promise<void>;
  listRepositories(): Promise<RepositoryInfo[]>;

  cloneRepository(params: CloneRepositoryParams): Promise<RepositoryInfo>;

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