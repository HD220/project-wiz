/* Service to interact with Git operations via Electron IPC. All code, comments, and identifiers in English as per project standards. */

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

declare global {
  interface Window {
    electron: {
      invoke: (channel: string, ...args: any[]) => Promise<any>;
    };
  }
}

export const gitService = {
  addRepository: (localPath: string, remoteUrl: string, credentialsId?: string): Promise<RepositoryInfo> =>
    window.electron.invoke("git:addRepository", localPath, remoteUrl, credentialsId),

  listRepositories: (): Promise<RepositoryInfo[]> =>
    window.electron.invoke("git:listRepositories"),

  getStatus: (repositoryId: string): Promise<StatusInfo> =>
    window.electron.invoke("git:getStatus", repositoryId),

  commitChanges: (params: CommitParams): Promise<void> =>
    window.electron.invoke("git:commitChanges", params),

  pushChanges: (params: PullPushParams): Promise<void> =>
    window.electron.invoke("git:pushChanges", params),

  pullChanges: (params: PullPushParams): Promise<void> =>
    window.electron.invoke("git:pullChanges", params),

  createBranch: (params: BranchParams): Promise<void> =>
    window.electron.invoke("git:createBranch", params),

  switchBranch: (params: BranchParams): Promise<void> =>
    window.electron.invoke("git:switchBranch", params),

  deleteBranch: (params: BranchParams): Promise<void> =>
    window.electron.invoke("git:deleteBranch", params),

  listBranches: (repositoryId: string): Promise<BranchInfo[]> =>
    window.electron.invoke("git:listBranches", repositoryId),

  getHistory: (repositoryId: string, branchName?: string): Promise<CommitInfo[]> =>
    window.electron.invoke("git:getHistory", repositoryId, branchName),

  syncWithRemote: (repositoryId: string, credentialsId?: string): Promise<void> =>
    window.electron.invoke("git:syncWithRemote", repositoryId, credentialsId),
};