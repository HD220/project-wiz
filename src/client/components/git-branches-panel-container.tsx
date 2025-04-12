import React, { useState, useCallback } from "react";
import { useGitBranches } from "../hooks/use-git-branches";
import { GitBranchesPanel } from "./git-branches-panel";
import { RepositoryInfo } from "../services/git-service";

interface GitBranchesPanelContainerProps {
  selectedRepo: RepositoryInfo | null;
}

export function GitBranchesPanelContainer({ selectedRepo }: GitBranchesPanelContainerProps) {
  const {
    branches,
    loading,
    createBranch,
    switchBranch,
    deleteBranch,
    fetchBranches,
    error,
    setError,
  } = useGitBranches(selectedRepo);

  const [newBranch, setNewBranch] = useState("");

  const handleNewBranchChange = useCallback((name: string) => {
    setNewBranch(name);
  }, []);

  const handleCreateBranch = useCallback(() => {
    if (!selectedRepo || !newBranch) return;
    createBranch({ repositoryId: selectedRepo.id, branchName: newBranch });
    setNewBranch("");
  }, [createBranch, selectedRepo, newBranch]);

  const handleSwitchBranch = useCallback(
    (branchName: string) => {
      if (!selectedRepo) return;
      switchBranch({ repositoryId: selectedRepo.id, branchName });
    },
    [switchBranch, selectedRepo]
  );

  const handleDeleteBranch = useCallback(
    (branchName: string) => {
      if (!selectedRepo) return;
      deleteBranch({ repositoryId: selectedRepo.id, branchName });
    },
    [deleteBranch, selectedRepo]
  );

  const handleRefreshBranches = useCallback(() => {
    if (!selectedRepo) return;
    fetchBranches(selectedRepo.id);
  }, [fetchBranches, selectedRepo]);

  return (
    <GitBranchesPanel
      loading={loading}
      branches={branches}
      newBranch={newBranch}
      onNewBranchChange={handleNewBranchChange}
      onCreateBranch={handleCreateBranch}
      onSwitchBranch={handleSwitchBranch}
      onDeleteBranch={handleDeleteBranch}
      onRefreshBranches={handleRefreshBranches}
    />
  );
}