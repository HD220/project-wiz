import React from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";

interface GitStatusPanelProps {
  loading: boolean;
  status: {
    modified: string[];
    staged: string[];
    untracked: string[];
    conflicted: string[];
  } | null;
  currentBranch: string;
  onRefresh: () => void;
}

export function GitStatusPanel({
  loading,
  status,
  currentBranch,
  onRefresh,
}: GitStatusPanelProps) {
  return (
    <Card className="mb-4">
      <h3 className="text-lg font-semibold mb-2">Status</h3>
      {loading ? (
        <div>Loading...</div>
      ) : status ? (
        <div>
          <div>
            <span className="font-medium">Branch:</span> {currentBranch}
          </div>
          <div>
            <span className="font-medium">Modified:</span>{" "}
            {status.modified.length > 0 ? status.modified.join(", ") : "None"}
          </div>
          <div>
            <span className="font-medium">Staged:</span>{" "}
            {status.staged.length > 0 ? status.staged.join(", ") : "None"}
          </div>
          <div>
            <span className="font-medium">Untracked:</span>{" "}
            {status.untracked.length > 0 ? status.untracked.join(", ") : "None"}
          </div>
          <div>
            <span className="font-medium">Conflicted:</span>{" "}
            {status.conflicted.length > 0 ? status.conflicted.join(", ") : "None"}
          </div>
          <Button
            variant="outline"
            className="mt-2"
            onClick={onRefresh}
            disabled={loading}
            aria-label="Refresh status"
          >
            Refresh Status
          </Button>
        </div>
      ) : (
        <div>No status available.</div>
      )}
    </Card>
  );
}