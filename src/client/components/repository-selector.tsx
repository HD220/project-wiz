import React from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Label } from "./ui/label";

/**
 * RepositorySelectorProps defines the properties for the RepositorySelector component.
 */
export interface RepositorySelectorProps {
  /** List of available repositories */
  repositories: Array<{ id: string; name: string }>;
  /** The currently selected repository, or null */
  selectedRepo: { id: string; name: string } | null;
  /** Handler to select a repository by id */
  onSelectRepository: (id: string) => void;
  /** Handler to sync the selected repository with remote */
  onSync: (id: string) => void;
  /** Whether the selector is in loading state */
  loading: boolean;
}

/**
 * RepositorySelector component for selecting a repository and syncing with remote.
 */
export function RepositorySelector({
  repositories,
  selectedRepo,
  onSelectRepository,
  onSync,
  loading,
}: RepositorySelectorProps) {
  return (
    <Card className="mb-4 p-4 flex flex-col gap-2">
      <Label htmlFor="repository-select">Repository:</Label>
      <Select
        value={selectedRepo?.id || ""}
        onValueChange={onSelectRepository}
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
        onClick={() => selectedRepo && onSync(selectedRepo.id)}
        disabled={loading || !selectedRepo}
        aria-label="Sync with remote"
      >
        Sync
      </Button>
    </Card>
  );
}