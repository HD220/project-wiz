import { useMemo } from "react";

export interface CommitInfo {
  hash: string;
  message: string;
  author: string;
  date: string;
}

/**
 * Hook to encapsulate formatting/filtering logic for commit history panel.
 * This prepares the commit list for display, following Clean Architecture.
 * Extend this hook to add filtering, sorting, or formatting as needed.
 */
export function useGitHistoryPanel(commits: CommitInfo[]) {
  // Example: here you could filter, sort, or format commits
  // For now, just return as is (future logic can be added here)
  const preparedCommits = useMemo(() => {
    return commits;
  }, [commits]);

  return {
    commits: preparedCommits,
  };
}