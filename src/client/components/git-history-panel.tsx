import React from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";

interface CommitInfo {
  hash: string;
  message: string;
  author: string;
  date: string;
}

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
  return (
    <Card>
      <h3 className="text-lg font-semibold mb-2">History</h3>
      <ul className="mb-2">
        {history.map(c => (
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