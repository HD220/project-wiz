import React from "react";
import { ErrorMessage } from "@/components/error-message";
import { RepositorySelector } from "@/components/repository-selector";
import { GitStatusPanel } from "@/components/git-status-panel";
import { GitCommitPanel } from "@/components/git-commit-panel";
import { GitBranchesPanel } from "@/components/git-branches-panel";
import { GitHistoryPanel } from "@/components/git-history-panel";

// Presentation component: receives all data and callbacks via props
export function RepositoriesPage(props: any) {
  const {
    repositories,
    selectedRepo,
    selectRepository,
    refreshRepositories,
    syncWithRemote,
    loading,
    error,
    status,
    fetchStatus,
    loadingStatus,
    errorStatus,
    branches,
    fetchBranches,
    createBranch,
    switchBranch,
    deleteBranch,
    loadingBranches,
    errorBranches,
    history,
    fetchHistory,
    loadingHistory,
    errorHistory,
    commitMessage,
    setCommitMessage,
    canCommit,
    commitError,
    commitChanges,
    pushChanges,
    pullChanges,
    loadingCommit,
    errorCommit,
    newBranch,
    setNewBranch,
    canCreateBranch,
    branchError,
  } = props;

  return (
    <div className="p-6 max-w-3xl">
      <h2 className="text-2xl font-bold mb-4">Git Integration</h2>
      <ErrorMessage message={error || ""} />
      <RepositorySelector
        repositories={repositories}
        selectedRepo={selectedRepo}
        onSelectRepository={selectRepository}
        onSync={syncWithRemote}
        loading={loading}
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
            loading={loadingCommit}
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