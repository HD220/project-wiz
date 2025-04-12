import { useState, useCallback, useEffect, useRef } from "react";
import { BranchInfo, BranchParams, RepositoryInfo } from "../services/git-service";
import * as branchService from "../services/git-branch-service";

/**
 * useListBranches
 * Hook to list branches for a repository, with cache and debounce.
 */
export function useListBranches(selectedRepo: RepositoryInfo | null, debounceMs = 300) {
  const [branches, setBranches] = useState<BranchInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cacheRef = useRef<{ [repoId: string]: BranchInfo[] }>({});
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  const fetchBranches = useCallback(
    (repo: RepositoryInfo | null) => {
      if (!repo) {
        setBranches([]);
        return;
      }
      setLoading(true);
      setError(null);

      if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

      debounceTimeout.current = setTimeout(async () => {
        try {
          // Use cache if available
          if (cacheRef.current[repo.id]) {
            setBranches(cacheRef.current[repo.id]);
            setLoading(false);
            return;
          }
          const result = await branchService.listBranches(repo);
          cacheRef.current[repo.id] = result;
          setBranches(result);
        } catch (err: any) {
          setError(err.message || "Failed to list branches.");
        } finally {
          setLoading(false);
        }
      }, debounceMs);
    },
    [debounceMs]
  );

  useEffect(() => {
    fetchBranches(selectedRepo);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRepo]);

  // Invalidate cache if needed
  const invalidateCache = useCallback((repoId: string) => {
    delete cacheRef.current[repoId];
  }, []);

  return { branches, fetchBranches, loading, error, setError, invalidateCache };
}

/**
 * useCreateBranch
 * Hook to create a branch and refresh the branch list.
 */
export function useCreateBranch(selectedRepo: RepositoryInfo | null, onBranchChanged?: () => void) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createBranch = useCallback(
    async (params: BranchParams) => {
      setLoading(true);
      setError(null);
      try {
        await branchService.createBranch(params);
        onBranchChanged && onBranchChanged();
      } catch (err: any) {
        setError(err.message || "Failed to create branch.");
      } finally {
        setLoading(false);
      }
    },
    [onBranchChanged]
  );

  return { createBranch, loading, error, setError };
}

/**
 * useSwitchBranch
 * Hook to switch branch and refresh the branch list.
 */
export function useSwitchBranch(selectedRepo: RepositoryInfo | null, onBranchChanged?: () => void) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const switchBranch = useCallback(
    async (params: BranchParams) => {
      setLoading(true);
      setError(null);
      try {
        await branchService.switchBranch(params);
        onBranchChanged && onBranchChanged();
      } catch (err: any) {
        setError(err.message || "Failed to switch branch.");
      } finally {
        setLoading(false);
      }
    },
    [onBranchChanged]
  );

  return { switchBranch, loading, error, setError };
}

/**
 * useDeleteBranch
 * Hook to delete a branch and refresh the branch list.
 */
export function useDeleteBranch(selectedRepo: RepositoryInfo | null, onBranchChanged?: () => void) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteBranch = useCallback(
    async (params: BranchParams) => {
      setLoading(true);
      setError(null);
      try {
        await branchService.deleteBranch(params);
        onBranchChanged && onBranchChanged();
      } catch (err: any) {
        setError(err.message || "Failed to delete branch.");
      } finally {
        setLoading(false);
      }
    },
    [onBranchChanged]
  );

  return { deleteBranch, loading, error, setError };
}

/**
 * useGitBranches
 * Orchestrator hook to manage git branches for a repository.
 * Aggregates all branch operations and state.
 */
export function useGitBranches(selectedRepo: RepositoryInfo | null) {
  const {
    branches,
    fetchBranches,
    loading: loadingList,
    error: errorList,
    setError: setListError,
    invalidateCache,
  } = useListBranches(selectedRepo);

  // Refresh branches after any operation
  const handleBranchChanged = useCallback(() => {
    if (selectedRepo) {
      invalidateCache(selectedRepo.id);
      fetchBranches(selectedRepo);
    }
  }, [selectedRepo, fetchBranches, invalidateCache]);

  const {
    createBranch,
    loading: loadingCreate,
    error: errorCreate,
    setError: setCreateError,
  } = useCreateBranch(selectedRepo, handleBranchChanged);

  const {
    switchBranch,
    loading: loadingSwitch,
    error: errorSwitch,
    setError: setSwitchError,
  } = useSwitchBranch(selectedRepo, handleBranchChanged);

  const {
    deleteBranch,
    loading: loadingDelete,
    error: errorDelete,
    setError: setDeleteError,
  } = useDeleteBranch(selectedRepo, handleBranchChanged);

  // Aggregate loading and error states
  const loading = loadingList || loadingCreate || loadingSwitch || loadingDelete;
  const error = errorList || errorCreate || errorSwitch || errorDelete;

  return {
    branches,
    fetchBranches,
    createBranch,
    switchBranch,
    deleteBranch,
    loading,
    error,
    setListError,
    setCreateError,
    setSwitchError,
    setDeleteError,
  };
}