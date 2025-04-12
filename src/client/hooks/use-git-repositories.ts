import { useState, useEffect, useCallback } from "react";
import { useAsyncAction } from "./use-async-action";
import { gitService as defaultGitService, RepositoryInfo } from "../services/git-service";

/**
 * Contract for the injected gitService.
 * Must provide:
 * - listRepositories(): Promise<RepositoryInfo[]>
 * - syncWithRemote(repositoryId: string, credentialsId?: string): Promise<void>
 * 
 * All methods must throw on error.
 */
export interface GitRepositoryServiceContract {
  listRepositories: () => Promise<RepositoryInfo[]>;
  syncWithRemote: (repositoryId: string, credentialsId?: string) => Promise<void>;
}

/**
 * Returns the first repository in the list, or null if empty.
 */
function getFirstRepository(repos: RepositoryInfo[]): RepositoryInfo | null {
  return repos.length > 0 ? repos[0] : null;
}

/**
 * Finds a repository by id in the list, or null if not found.
 */
function findRepositoryById(repos: RepositoryInfo[], id: string): RepositoryInfo | null {
  return repos.find((r) => r.id === id) || null;
}

/**
 * Validates that the repository id is a non-empty string.
 */
function validateRepositoryId(id: unknown): id is string {
  return typeof id === "string" && id.length > 0;
}

/**
 * Centralized error handler for git repository operations.
 */
function handleRepositoryError(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "Unknown repository error";
}

/**
 * useGitRepositories
 * Hook to manage git repositories state, selection and sync.
 * 
 * @param gitService - Service to interact with git (default: gitService)
 */
export function useGitRepositories(
  gitService: GitRepositoryServiceContract = defaultGitService
) {
  const [repositories, setRepositories] = useState<RepositoryInfo[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<RepositoryInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Refreshes the list of repositories and selects the first one if none is selected.
   */
  const refreshRepositories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const repos = await gitService.listRepositories();
      setRepositories(repos);
      if (!selectedRepo) {
        setSelectedRepo(getFirstRepository(repos));
      }
    } catch (err) {
      setError(handleRepositoryError(err));
    } finally {
      setLoading(false);
    }
  }, [gitService, selectedRepo]);

  /**
   * Selects a repository by id.
   */
  const selectRepository = useCallback(
    (repoId: string) => {
      if (!validateRepositoryId(repoId)) {
        setError("Invalid repository id");
        return;
      }
      const repo = findRepositoryById(repositories, repoId);
      setSelectedRepo(repo);
    },
    [repositories]
  );

  /**
   * Syncs the selected repository with remote.
   */
  const syncWithRemote = useCallback(
    async (repositoryId: string, credentialsId?: string) => {
      setLoading(true);
      setError(null);
      if (!validateRepositoryId(repositoryId)) {
        setError("Invalid repository id");
        setLoading(false);
        return;
      }
      try {
        await gitService.syncWithRemote(repositoryId, credentialsId);
      } catch (err) {
        setError(handleRepositoryError(err));
      } finally {
        setLoading(false);
      }
    },
    [gitService]
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
    setSelectedRepo, // exposto para integração futura com contexto global
    setRepositories, // exposto para integração futura com contexto global
  };
}