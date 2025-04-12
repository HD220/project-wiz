import { useState, useCallback, useEffect } from "react";
import { useAsyncAction } from "./use-async-action";
import { gitService as defaultGitService, StatusInfo, RepositoryInfo } from "../services/git-service";

/**
 * useGitStatus
 * Hook to fetch and manage git status for a repository.
 * 
 * @param selectedRepo - The selected repository (RepositoryInfo or null)
 * @param gitService - Service to interact with git (default: gitService)
 */
export function useGitStatus(selectedRepo: RepositoryInfo | null, gitService = defaultGitService) {
  const [status, setStatus] = useState<StatusInfo | null>(null);
  const [execute, loading, error, setError] = useAsyncAction();

  const fetchStatus = useCallback(
    execute(async (repoId: string) => {
      const s = await gitService.getStatus(repoId);
      setStatus(s);
    }),
    [gitService, execute]
  );

  useEffect(() => {
    if (selectedRepo) {
      fetchStatus(selectedRepo.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRepo]);

  return {
    status,
    fetchStatus,
    loading,
    error,
    setError,
  };
}