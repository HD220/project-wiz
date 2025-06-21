export interface IRepoManager {
  init(): Promise<void>;
  config(configs: { key: string; value: string }[]): Promise<void>;
  status(): Promise<string>;
  clone(url: string, directory?: string): Promise<void>;
  currentWorkingDirectory(): Promise<string>;
  changeWorkingDirectory(path: string): Promise<void>;
}

export interface ICommitManager {
  commit(message: string): Promise<void>;
}

export interface IBranchManager {
  branches(): Promise<string[]>;
  removeBranch(branch: string): Promise<void>;
  switch(branch: string): Promise<void>;
  merge(branch: string): Promise<void>;
}

export interface IRemoteManager {
  setRemote(name: string, url: string): Promise<void>;
  removeRemote(name: string): Promise<void>;
  sync(branch: string): Promise<void>;
}

export interface IWorktreeManager {
  createWorktree(path: string, branch: string): Promise<void>;
  worktrees(): Promise<string[]>;
  removeWorktree(path: string): Promise<void>;
}

export interface IVersionControlSystem
  extends IRepoManager,
    ICommitManager,
    IBranchManager,
    IRemoteManager,
    IWorktreeManager {}
