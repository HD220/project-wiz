/**
 * GitHistoryService
 * Pure application service to fetch git commit history with validation, pagination, and error handling.
 * All code, types, and comments must be in English (see SDR-0001).
 */

import { CommitInfo } from "./git-service";

export interface FetchGitHistoryParams {
  repositoryId: string;
  branchName?: string;
  page?: number;
  pageSize?: number;
  signal?: AbortSignal;
}

export interface FetchGitHistoryResult {
  commits: CommitInfo[];
  page: number;
  pageSize: number;
  total: number | null;
}

export class GitHistoryServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GitHistoryServiceError";
  }
}

/**
 * Fetches git commit history for a repository with optional pagination.
 * Validates parameters and centralizes error handling.
 * 
 * @param params - FetchGitHistoryParams
 * @param gitHistoryFetcher - Function to fetch history (injected, testable)
 * @returns Promise<FetchGitHistoryResult>
 * @throws GitHistoryServiceError on validation or fetch error
 */
export async function fetchGitHistory(
  params: FetchGitHistoryParams,
  gitHistoryFetcher: (
    repositoryId: string,
    branchName?: string,
    page?: number,
    pageSize?: number,
    signal?: AbortSignal
  ) => Promise<{ commits: CommitInfo[]; total: number | null }>
): Promise<FetchGitHistoryResult> {
  const { repositoryId, branchName, page = 1, pageSize = 50, signal } = params;

  if (!repositoryId || typeof repositoryId !== "string") {
    throw new GitHistoryServiceError("Invalid repositoryId");
  }
  if (branchName && typeof branchName !== "string") {
    throw new GitHistoryServiceError("Invalid branchName");
  }
  if (typeof page !== "number" || page < 1) {
    throw new GitHistoryServiceError("Invalid page");
  }
  if (typeof pageSize !== "number" || pageSize < 1 || pageSize > 500) {
    throw new GitHistoryServiceError("Invalid pageSize");
  }

  try {
    const { commits, total } = await gitHistoryFetcher(
      repositoryId,
      branchName,
      page,
      pageSize,
      signal
    );
    return {
      commits,
      page,
      pageSize,
      total: total ?? null,
    };
  } catch (err: any) {
    throw new GitHistoryServiceError(
      err?.message || "Failed to fetch git history"
    );
  }
}