import { useState, useEffect, useCallback } from "react";
import { useAsyncAction } from "./use-async-action";
import { gitService as defaultGitService, RepositoryInfo } from "../services/git-service";

/**
 * useGitRepositories
 * Hook to manage git repositories list, selection and sync.
 * 
 * @param gitService - Service to interact with git (default: gitService)
 */
export function useGitRepositories(gitService = defaultGitService) {
  const [repositories, setRepositories] = useState<RepositoryInfo[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<RepositoryInfo | null>(null);

  const [execute, loading, error, setError] = useAsyncAction();

  const refreshRepositories = useCallback(
    execute(async () => {
      const repos = await gitService.listRepositories();
      setRepositories(repos);
      if (repos.length > 0 && !selectedRepo) setSelectedRepo(repos[0]);
    }),
    [gitService, selectedRepo, execute]
  );

  const selectRepository = useCallback((repoId: string) => {
    const repo = repositories.find((r: RepositoryInfo) => r.id === repoId) || null;
    setSelectedRepo(repo);
  }, [repositories]);

  const syncWithRemote = useCallback(
    execute(async (repositoryId: string, credentialsId?: string) => {
      await gitService.syncWithRemote(repositoryId, credentialsId);
    }),
    [gitService, execute]
  );

  useEffect(() => {
    refreshRepositories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    repositories,
    selectedRepo,
    selectRepository,
    refreshRepositories,
    syncWithRemote,
    loading,
    error,
    setError,
  };
}