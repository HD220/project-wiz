import React from "react";
import { useGitRepositories } from "../hooks/use-git-repositories";
import { useGitStatus } from "../hooks/use-git-status";
import { useGitBranches } from "../hooks/use-git-branches";
import { useGitHistory } from "../hooks/use-git-history";
import { useGitSync } from "../hooks/use-git-sync";
import { useCommitMessage } from "../hooks/use-commit-message";
import { useNewBranch } from "../hooks/use-new-branch";
import { RepositorySelector } from "./repository-selector";
import { ErrorMessage } from "./error-message";
import { GitStatusPanel } from "./git-status-panel";
import { GitCommitPanel } from "./git-commit-panel";
import { GitBranchesPanel } from "./git-branches-panel";
import { GitHistoryPanel } from "./git-history-panel";

export function GitRepositoryPanel() {
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

  // Sync (commit, push, pull)
  const {
    commitChanges,
    pushChanges,
    pullChanges,
    loading: loadingSync,
    error: errorSync,
  } = useGitSync(selectedRepo);

  // Commit message
  const {
    commitMessage,
    setCommitMessage,
    isValid: canCommit,
    error: commitError,
  } = useCommitMessage();

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
    loadingSync;
  const error =
    errorRepos ||
    errorStatus ||
    errorBranches ||
    errorHistory ||
    errorSync;

  return (
    <div className="p-6 max-w-3xl">
      <h2 className="text-2xl font-bold mb-4">Git Integration</h2>
      <ErrorMessage message={error || ""} />
      <RepositorySelector
        repositories={repositories}
        selectedRepo={selectedRepo}
        onSelectRepository={selectRepository}
        onSync={syncWithRemote}
        loading={loadingRepos}
      />
      {selectedRepo && (
        <div className="flex flex-col gap-4">
          <GitStatusPanel
            loading={loadingStatus}
            status={status}
            currentBranch={selectedRepo.currentBranch}
            onRefresh={() => fetchStatus(selectedRepo.id)}
          />
          <ErrorMessage message={commitError || ""} />
          <GitCommitPanel
            loading={loadingSync}
            commitMsg={commitMessage}
            onCommitMsgChange={setCommitMessage}
            onCommit={() =>
              selectedRepo &&
              commitChanges({ repositoryId: selectedRepo.id, message: commitMessage })
            }
            onPush={() =>
              selectedRepo && pushChanges({ repositoryId: selectedRepo.id })
            }
            onPull={() =>
              selectedRepo && pullChanges({ repositoryId: selectedRepo.id })
            }
            canCommit={canCommit}
          />
          <ErrorMessage message={branchError || ""} />
          <GitBranchesPanel
            loading={loadingBranches}
            branches={branches}
            newBranch={newBranch}
            onNewBranchChange={setNewBranch}
            onCreateBranch={() =>
              selectedRepo &&
              createBranch({ repositoryId: selectedRepo.id, branchName: newBranch })
            }
            onSwitchBranch={branchName =>
              selectedRepo &&
              switchBranch({ repositoryId: selectedRepo.id, branchName })
            }
            onDeleteBranch={branchName =>
              selectedRepo &&
              deleteBranch({ repositoryId: selectedRepo.id, branchName })
            }
            onRefreshBranches={() => fetchBranches(selectedRepo.id)}
          />
          <GitHistoryPanel
            loading={loadingHistory}
            history={history}
            onRefreshHistory={() => fetchHistory(selectedRepo.id)}
          />
        </div>
      )}
    </div>
  );
}