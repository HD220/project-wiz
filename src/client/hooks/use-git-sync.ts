import { useCallback } from "react";
import { useAsyncAction } from "./use-async-action";
import {
  gitService as defaultGitService,
  CommitParams,
  PullPushParams,
  RepositoryInfo,
} from "../services/git-service";

/**
 * useGitSync
 * Hook to handle commit, push and pull operations for a repository.
 * 
 * @param selectedRepo - The selected repository (RepositoryInfo or null)
 * @param gitService - Service to interact with git (default: gitService)
 */
export function useGitSync(selectedRepo: RepositoryInfo | null, gitService = defaultGitService) {
  const [execute, loading, error, setError] = useAsyncAction();

  const commitChanges = useCallback(
    execute(async (params: CommitParams) => {
      await gitService.commitChanges(params);
    }),
    [gitService, execute]
  );

  const pushChanges = useCallback(
    execute(async (params: PullPushParams) => {
      await gitService.pushChanges(params);
    }),
    [gitService, execute]
  );

  const pullChanges = useCallback(
    execute(async (params: PullPushParams) => {
      await gitService.pullChanges(params);
    }),
    [gitService, execute]
  );

  return {
    commitChanges,
    pushChanges,
    pullChanges,
    loading,
    error,
    setError,
  };
}