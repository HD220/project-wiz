export interface RepositoryInfo {
  id: string;
  name: string;
  localPath: string;
  remoteUrl: string;
  currentBranch: string;
}

export interface StatusInfo {
  modified: string[];
  staged: string[];
  untracked: string[];
  conflicted: string[];
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
}

export interface BranchParams {
  repositoryId: string;
  branchName: string;
  sourceBranch?: string;
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