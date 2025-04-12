import { useCallback, useEffect, useState } from "react";
import { gitService, RepositoryInfo, StatusInfo, BranchInfo, CommitInfo, CommitParams, PullPushParams, BranchParams } from "../services/git-service";

export function useGitRepository() {
  const [repositories, setRepositories] = useState<RepositoryInfo[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<RepositoryInfo | null>(null);
  const [status, setStatus] = useState<StatusInfo | null>(null);
  const [branches, setBranches] = useState<BranchInfo[]>([]);
  const [history, setHistory] = useState<CommitInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshRepositories = useCallback(async () => {
    setLoading(true);
    try {
      const repos = await gitService.listRepositories();
      setRepositories(repos);
      if (repos.length > 0 && !selectedRepo) setSelectedRepo(repos[0]);
    } catch (e: any) {
      setError(e.message || "Failed to list repositories");
    } finally {
      setLoading(false);
    }
  }, [selectedRepo]);

  const selectRepository = useCallback((repoId: string) => {
    const repo = repositories.find((r: RepositoryInfo) => r.id === repoId) || null;
    setSelectedRepo(repo);
  }, [repositories]);

  const fetchStatus = useCallback(async (repoId: string) => {
    setLoading(true);
    try {
      const s = await gitService.getStatus(repoId);
      setStatus(s);
    } catch (e: any) {
      setError(e.message || "Failed to get status");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchBranches = useCallback(async (repoId: string) => {
    setLoading(true);
    try {
      const b = await gitService.listBranches(repoId);
      setBranches(b);
    } catch (e: any) {
      setError(e.message || "Failed to get branches");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchHistory = useCallback(async (repoId: string, branchName?: string) => {
    setLoading(true);
    try {
      const h = await gitService.getHistory(repoId, branchName);
      setHistory(h);
    } catch (e: any) {
      setError(e.message || "Failed to get history");
    } finally {
      setLoading(false);
    }
  }, []);

  const commitChanges = useCallback(async (params: CommitParams) => {
    setLoading(true);
    try {
      await gitService.commitChanges(params);
      if (selectedRepo) await fetchStatus(selectedRepo.id);
    } catch (e: any) {
      setError(e.message || "Failed to commit changes");
    } finally {
      setLoading(false);
    }
  }, [selectedRepo, fetchStatus]);

  const pushChanges = useCallback(async (params: PullPushParams) => {
    setLoading(true);
    try {
      await gitService.pushChanges(params);
    } catch (e: any) {
      setError(e.message || "Failed to push changes");
    } finally {
      setLoading(false);
    }
  }, []);

  const pullChanges = useCallback(async (params: PullPushParams) => {
    setLoading(true);
    try {
      await gitService.pullChanges(params);
      if (selectedRepo) await fetchStatus(selectedRepo.id);
    } catch (e: any) {
      setError(e.message || "Failed to pull changes");
    } finally {
      setLoading(false);
    }
  }, [selectedRepo, fetchStatus]);

  const createBranch = useCallback(async (params: BranchParams) => {
    setLoading(true);
    try {
      await gitService.createBranch(params);
      if (selectedRepo) await fetchBranches(selectedRepo.id);
    } catch (e: any) {
      setError(e.message || "Failed to create branch");
    } finally {
      setLoading(false);
    }
  }, [selectedRepo, fetchBranches]);

  const switchBranch = useCallback(async (params: BranchParams) => {
    setLoading(true);
    try {
      await gitService.switchBranch(params);
      if (selectedRepo) {
        await fetchStatus(selectedRepo.id);
        await fetchBranches(selectedRepo.id);
        await fetchHistory(selectedRepo.id, params.branchName);
      }
    } catch (e: any) {
      setError(e.message || "Failed to switch branch");
    } finally {
      setLoading(false);
    }
  }, [selectedRepo, fetchStatus, fetchBranches, fetchHistory]);

  const deleteBranch = useCallback(async (params: BranchParams) => {
    setLoading(true);
    try {
      await gitService.deleteBranch(params);
      if (selectedRepo) await fetchBranches(selectedRepo.id);
    } catch (e: any) {
      setError(e.message || "Failed to delete branch");
    } finally {
      setLoading(false);
    }
  }, [selectedRepo, fetchBranches]);

  const syncWithRemote = useCallback(async (repositoryId: string, credentialsId?: string) => {
    setLoading(true);
    try {
      await gitService.syncWithRemote(repositoryId, credentialsId);
      if (selectedRepo) await fetchStatus(selectedRepo.id);
    } catch (e: any) {
      setError(e.message || "Failed to sync with remote");
    } finally {
      setLoading(false);
    }
  }, [selectedRepo, fetchStatus]);

  useEffect(() => {
    refreshRepositories();
  }, [refreshRepositories]);

  useEffect(() => {
    if (selectedRepo) {
      fetchStatus(selectedRepo.id);
      fetchBranches(selectedRepo.id);
      fetchHistory(selectedRepo.id);
    }
  }, [selectedRepo, fetchStatus, fetchBranches, fetchHistory]);

  return {
    repositories,
    selectedRepo,
    selectRepository,
    status,
    branches,
    history,
    loading,
    error,
    refreshRepositories,
    fetchStatus,
    fetchBranches,
    fetchHistory,
    commitChanges,
    pushChanges,
    pullChanges,
    createBranch,
    switchBranch,
    deleteBranch,
    syncWithRemote,
  };
}