import React, { useState } from "react";
import { useGitRepository } from "../hooks/use-git-repository";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Label } from "./ui/label";
import { GitStatusPanel } from "./git-status-panel";
import { GitCommitPanel } from "./git-commit-panel";
import { GitBranchesPanel } from "./git-branches-panel";
import { GitHistoryPanel } from "./git-history-panel";

export function GitRepositoryPanel() {
  const {
    repositories,
    selectedRepo,
    selectRepository,
    status,
    branches,
    history,
    loading,
    error,
    commitChanges,
    pushChanges,
    pullChanges,
    createBranch,
    switchBranch,
    deleteBranch,
    syncWithRemote,
    fetchStatus,
    fetchBranches,
    fetchHistory,
  } = useGitRepository();

  const [commitMsg, setCommitMsg] = useState("");
  const [newBranch, setNewBranch] = useState("");

  return (
    <div className="p-6 max-w-3xl">
      <h2 className="text-2xl font-bold mb-4">Git Integration</h2>
      {error && <div className="text-red-600 mb-2">{error}</div>}
      <Card className="mb-4 p-4 flex flex-col gap-2">
        <Label htmlFor="repository-select">Repository:</Label>
        <Select
          value={selectedRepo?.id || ""}
          onValueChange={selectRepository}
          disabled={loading}
        >
          <SelectTrigger id="repository-select" aria-label="Select repository">
            <SelectValue placeholder="Select..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Select...</SelectItem>
            {repositories.map(repo => (
              <SelectItem key={repo.id} value={repo.id}>
                {repo.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          onClick={() => selectedRepo && syncWithRemote(selectedRepo.id)}
          disabled={loading || !selectedRepo}
          aria-label="Sync with remote"
        >
          Sync
        </Button>
      </Card>

      {selectedRepo && (
        <div className="flex flex-col gap-4">
          <GitStatusPanel
            loading={loading}
            status={status}
            currentBranch={selectedRepo.currentBranch}
            onRefresh={() => fetchStatus(selectedRepo.id)}
          />
          <GitCommitPanel
            loading={loading}
            commitMsg={commitMsg}
            onCommitMsgChange={setCommitMsg}
            onCommit={() =>
              selectedRepo &&
              commitChanges({ repositoryId: selectedRepo.id, message: commitMsg })
            }
            onPush={() =>
              selectedRepo && pushChanges({ repositoryId: selectedRepo.id })
            }
            onPull={() =>
              selectedRepo && pullChanges({ repositoryId: selectedRepo.id })
            }
            canCommit={!!commitMsg}
          />
          <GitBranchesPanel
            loading={loading}
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
            loading={loading}
            history={history}
            onRefreshHistory={() => fetchHistory(selectedRepo.id)}
          />
        </div>
      )}
    </div>
  );
}