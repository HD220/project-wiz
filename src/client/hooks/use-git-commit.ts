import { useCommitMessage } from "./use-commit-message";
import { useGitSync } from "./use-git-sync";
import type {
  RepositoryInfo,
  CommitParams,
  PullPushParams,
} from "../services/git-service";

export interface UseGitCommitResult {
  commitMessage: string;
  setCommitMessage: (msg: string) => void;
  canCommit: boolean;
  commitError: string | null;
  commitChanges: (params: CommitParams) => Promise<void>;
  pushChanges: (params: PullPushParams) => Promise<void>;
  pullChanges: (params: PullPushParams) => Promise<void>;
  loading: boolean;
  error: string | null;
}

export function useGitCommit(selectedRepo: RepositoryInfo | null): UseGitCommitResult {
  const {
    commitMessage,
    setCommitMessage,
    isValid: canCommit,
    error: commitErrorRaw,
  } = useCommitMessage();

  const {
    commitChanges: commitChangesRaw,
    pushChanges: pushChangesRaw,
    pullChanges: pullChangesRaw,
    loading: loadingSync,
    error: errorSync,
  } = useGitSync(selectedRepo);

  const commitError = commitErrorRaw ?? null;

  const commitChanges = async (params: CommitParams) => {
    if (!params.repositoryId || !params.message) {
      throw new Error("Invalid commit parameters: repositoryId and message are required.");
    }
    await commitChangesRaw(params);
  };

  const pushChanges = async (params: PullPushParams) => {
    if (!params.repositoryId) {
      throw new Error("Invalid push parameters: repositoryId is required.");
    }
    await pushChangesRaw(params);
  };

  const pullChanges = async (params: PullPushParams) => {
    if (!params.repositoryId) {
      throw new Error("Invalid pull parameters: repositoryId is required.");
    }
    await pullChangesRaw(params);
  };

  return {
    commitMessage,
    setCommitMessage,
    canCommit,
    commitError,
    commitChanges,
    pushChanges,
    pullChanges,
    loading: loadingSync,
    error: errorSync ?? null,
  };
}