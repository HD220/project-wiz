import { useState, useCallback, useEffect } from "react";
import { useAsyncAction } from "./use-async-action";
import {
  gitService as defaultGitService,
  BranchInfo,
  BranchParams,
  RepositoryInfo,
} from "../services/git-service";

/**
 * useGitBranches
 * Hook to manage git branches for a repository.
 * 
 * @param selectedRepo - The selected repository (RepositoryInfo or null)
 * @param gitService - Service to interact with git (default: gitService)
 */
export function useGitBranches(selectedRepo: RepositoryInfo | null, gitService = defaultGitService) {
  const [branches, setBranches] = useState<BranchInfo[]>([]);
  const [execute, loading, error, setError] = useAsyncAction();

  const fetchBranches = useCallback(
    execute(async (repoId: string) => {
      const b = await gitService.listBranches(repoId);
      setBranches(b);
    }),
    [gitService, execute]
  );

  const createBranch = useCallback(
    execute(async (params: BranchParams) => {
      await gitService.createBranch(params);
      if (selectedRepo) await fetchBranches(selectedRepo.id);
    }),
    [gitService, selectedRepo, fetchBranches, execute]
  );

  const switchBranch = useCallback(
    execute(async (params: BranchParams) => {
      await gitService.switchBranch(params);
      if (selectedRepo) await fetchBranches(selectedRepo.id);
    }),
    [gitService, selectedRepo, fetchBranches, execute]
  );

  const deleteBranch = useCallback(
    execute(async (params: BranchParams) => {
      await gitService.deleteBranch(params);
      if (selectedRepo) await fetchBranches(selectedRepo.id);
    }),
    [gitService, selectedRepo, fetchBranches, execute]
  );

  useEffect(() => {
    if (selectedRepo) {
      fetchBranches(selectedRepo.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRepo]);

  return {
    branches,
    fetchBranches,
    createBranch,
    switchBranch,
    deleteBranch,
    loading,
    error,
    setError,
  };
}