import { useState, useCallback, useEffect } from "react";
import { useAsyncAction } from "./use-async-action";
import {
  gitService as defaultGitService,
  CommitInfo,
  RepositoryInfo,
} from "../services/git-service";

/**
 * useGitHistory
 * Hook to fetch and manage git commit history for a repository.
 * 
 * @param selectedRepo - The selected repository (RepositoryInfo or null)
 * @param branchName - Optional branch name
 * @param gitService - Service to interact with git (default: gitService)
 */
export function useGitHistory(
  selectedRepo: RepositoryInfo | null,
  branchName?: string,
  gitService = defaultGitService
) {
  const [history, setHistory] = useState<CommitInfo[]>([]);
  const [execute, loading, error, setError] = useAsyncAction();

  const fetchHistory = useCallback(
    execute(async (repoId: string, branch?: string) => {
      const h = await gitService.getHistory(repoId, branch);
      setHistory(h);
    }),
    [gitService, execute]
  );

  useEffect(() => {
    if (selectedRepo) {
      fetchHistory(selectedRepo.id, branchName);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRepo, branchName]);

  return {
    history,
    fetchHistory,
    loading,
    error,
    setError,
  };
}