import React from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card } from "./ui/card";
import { Label } from "./ui/label";

interface GitCommitPanelProps {
  loading: boolean;
  commitMsg: string;
  onCommitMsgChange: (msg: string) => void;
  onCommit: () => void;
  onPush: () => void;
  onPull: () => void;
  canCommit: boolean;
}

export function GitCommitPanel({
  loading,
  commitMsg,
  onCommitMsgChange,
  onCommit,
  onPush,
  onPull,
  canCommit,
}: GitCommitPanelProps) {
  return (
    <Card className="mb-4">
      <h3 className="text-lg font-semibold mb-2">Commit</h3>
      <div className="flex flex-col gap-2">
        <Label htmlFor="commit-message">Commit message</Label>
        <Input
          id="commit-message"
          type="text"
          value={commitMsg}
          onChange={e => onCommitMsgChange(e.target.value)}
          placeholder="Commit message"
          className="w-full max-w-md"
          aria-label="Commit message"
          disabled={loading}
        />
        <div className="flex gap-2 mt-2">
          <Button
            onClick={onCommit}
            disabled={loading || !canCommit}
            aria-label="Commit all changes"
          >
            Commit All
          </Button>
          <Button
            onClick={onPush}
            disabled={loading}
            variant="secondary"
            aria-label="Push changes"
          >
            Push
          </Button>
          <Button
            onClick={onPull}
            disabled={loading}
            variant="secondary"
            aria-label="Pull changes"
          >
            Pull
          </Button>
        </div>
      </div>
    </Card>
  );
}