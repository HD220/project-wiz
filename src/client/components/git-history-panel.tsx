import React from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { useGitHistoryPanel, CommitInfo } from "../hooks/use-git-history-panel";

interface GitHistoryPanelProps {
  loading: boolean;
  history: CommitInfo[];
  onRefreshHistory: () => void;
}

export function GitHistoryPanel({
  loading,
  history,
  onRefreshHistory,
}: GitHistoryPanelProps) {
  const { commits } = useGitHistoryPanel(history);

  return (
    <Card>
      <h3 className="text-lg font-semibold mb-2">History</h3>
      <ul className="mb-2">
        {commits.map((c) => (
          <li key={c.hash}>
            <b>{c.message}</b> - {c.author} ({c.date})
          </li>
        ))}
      </ul>
      <Button
        variant="outline"
        onClick={onRefreshHistory}
        disabled={loading}
        aria-label="Refresh history"
      >
        Refresh History
      </Button>
    </Card>
  );
}