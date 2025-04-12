import React from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card } from "./ui/card";
import { Label } from "./ui/label";

interface BranchInfo {
  name: string;
  isCurrent: boolean;
  isRemote?: boolean;
}

interface GitBranchesPanelProps {
  loading: boolean;
  branches: BranchInfo[];
  newBranch: string;
  onNewBranchChange: (name: string) => void;
  onCreateBranch: () => void;
  onSwitchBranch: (branchName: string) => void;
  onDeleteBranch: (branchName: string) => void;
  onRefreshBranches: () => void;
}

export function GitBranchesPanel({
  loading,
  branches,
  newBranch,
  onNewBranchChange,
  onCreateBranch,
  onSwitchBranch,
  onDeleteBranch,
  onRefreshBranches,
}: GitBranchesPanelProps) {
  return (
    <Card className="mb-4">
      <h3 className="text-lg font-semibold mb-2">Branches</h3>
      <ul className="mb-2">
        {branches.map(b => (
          <li key={b.name} className="flex items-center gap-2">
            <span>
              {b.name} {b.isCurrent && <b>(current)</b>}
            </span>
            {!b.isCurrent && (
              <Button
                size="sm"
                onClick={() => onSwitchBranch(b.name)}
                disabled={loading}
                aria-label={`Switch to branch ${b.name}`}
              >
                Switch
              </Button>
            )}
            {!b.isCurrent && !b.isRemote && (
              <Button
                size="sm"
                variant="destructive"
                onClick={() => onDeleteBranch(b.name)}
                disabled={loading}
                aria-label={`Delete branch ${b.name}`}
              >
                Delete
              </Button>
            )}
          </li>
        ))}
      </ul>
      <div className="flex items-end gap-2 mb-2">
        <div className="flex flex-col">
          <Label htmlFor="new-branch">New branch name</Label>
          <Input
            id="new-branch"
            type="text"
            value={newBranch}
            onChange={e => onNewBranchChange(e.target.value)}
            placeholder="New branch name"
            aria-label="New branch name"
            disabled={loading}
          />
        </div>
        <Button
          onClick={onCreateBranch}
          disabled={loading || !newBranch}
          aria-label="Create branch"
        >
          Create Branch
        </Button>
      </div>
      <Button
        variant="outline"
        onClick={onRefreshBranches}
        disabled={loading}
        aria-label="Refresh branches"
      >
        Refresh Branches
      </Button>
    </Card>
  );
}