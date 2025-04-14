import React from "react";
import { useGitRepositories } from "../../../hooks/use-git-repositories";
import { useGitStatus } from "../../../hooks/use-git-status";
import { useGitBranches } from "../../../hooks/use-git-branches";
import { useGitHistory } from "../../../hooks/use-git-history";
import { useGitCommit } from "../../../hooks/use-git-commit";
import { useNewBranch } from "../../../hooks/use-new-branch";
import { RepositoriesPage } from "../presentation/RepositoriesPage";

// Controller: orchestrates hooks and passes data to the presentation component
export function RepositoriesController() {
  // Repositories
  const {
    repositories,
    selectedRepo,
    selectRepository,
    refreshRepositories,
    syncWithRemote,
    loading: loadingRepos,
    error: errorRepos,
  } = useGitRepositories();

  // Status
  const {
    status,
    fetchStatus,
    loading: loadingStatus,
    error: errorStatus,
  } = useGitStatus(selectedRepo);

  // Branches
  const {
    branches,
    fetchBranches,
    createBranch,
    switchBranch,
    deleteBranch,
    loading: loadingBranches,
    error: errorBranches,
  } = useGitBranches(selectedRepo);

  // History
  const {
    history,
    fetchHistory,
    loading: loadingHistory,
    error: errorHistory,
  } = useGitHistory(selectedRepo);

  // Commit logic
  const {
    commitMessage,
    setCommitMessage,
    canCommit,
    commitError,
    commitChanges,
    pushChanges,
    pullChanges,
    loading: loadingCommit,
    error: errorCommit,
  } = useGitCommit(selectedRepo);

  // New branch
  const {
    newBranch,
    setNewBranch,
    isValid: canCreateBranch,
    error: branchError,
  } = useNewBranch();

  // Aggregate loading and error for top-level display
  const loading =
    loadingRepos ||
    loadingStatus ||
    loadingBranches ||
    loadingHistory ||
    loadingCommit;
  const error =
    errorRepos ||
    errorStatus ||
    errorBranches ||
    errorHistory ||
    errorCommit;

  return (
    <RepositoriesPage
      repositories={repositories}
      selectedRepo={selectedRepo}
      selectRepository={selectRepository}
      refreshRepositories={refreshRepositories}
      syncWithRemote={syncWithRemote}
      loading={loading}
      error={error}
      status={status}
      fetchStatus={fetchStatus}
      loadingStatus={loadingStatus}
      errorStatus={errorStatus}
      branches={branches}
      fetchBranches={fetchBranches}
      createBranch={createBranch}
      switchBranch={switchBranch}
      deleteBranch={deleteBranch}
      loadingBranches={loadingBranches}
      errorBranches={errorBranches}
      history={history}
      fetchHistory={fetchHistory}
      loadingHistory={loadingHistory}
      errorHistory={errorHistory}
      commitMessage={commitMessage}
      setCommitMessage={setCommitMessage}
      canCommit={canCommit}
      commitError={commitError}
      commitChanges={commitChanges}
      pushChanges={pushChanges}
      pullChanges={pullChanges}
      loadingCommit={loadingCommit}
      errorCommit={errorCommit}
      newBranch={newBranch}
      setNewBranch={setNewBranch}
      canCreateBranch={canCreateBranch}
      branchError={branchError}
    />
  );
}