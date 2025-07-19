export interface GitOperationResult {
  success: boolean;
  output?: string;
  error?: string;
}

export interface WorktreeInfo {
  path: string;
  projectId: string;
  taskId: string;
  createdAt: Date;
}

export interface GitInitOptions {
  localPath: string;
  initialBranch?: string;
}

export interface GitCloneOptions {
  gitUrl: string;
  localPath: string;
  branch?: string | undefined;
  depth?: number;
}

export interface CommitOptions {
  message: string;
  author?: {
    name: string;
    email: string;
  };
}

export type GitOperation =
  | "init"
  | "clone"
  | "worktree-add"
  | "worktree-remove"
  | "commit"
  | "status"
  | "log";
