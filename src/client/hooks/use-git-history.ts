import { useState, useCallback, useRef, useEffect } from "react";
import { fetchGitHistory, FetchGitHistoryParams, FetchGitHistoryResult, GitHistoryServiceError } from "../services/git-history-service";
import { CommitInfo, RepositoryInfo, gitService } from "../services/git-service";

/**
 * GitHistoryFetcherContract
 * Contract for the injected fetcher function used by fetchGitHistory.
 * Must return { commits, total } for the given repository, branch, page, and pageSize.
 */
export type GitHistoryFetcherContract = (
  repositoryId: string,
  branchName?: string,
  page?: number,
  pageSize?: number,
  signal?: AbortSignal
) => Promise<{ commits: CommitInfo[]; total: number | null }>;

/**
 * Default implementation using gitService.getHistory (no pagination support).
 * For real pagination, backend must support it.
 */
const defaultGitHistoryFetcher: GitHistoryFetcherContract = async (
  repositoryId,
  branchName,
  page = 1,
  pageSize = 50,
  signal
) => {
  // No real pagination in gitService.getHistory, so we fetch all and slice.
  const allCommits = await gitService.getHistory(repositoryId, branchName);
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  return {
    commits: allCommits.slice(start, end),
    total: allCommits.length,
  };
};

interface UseGitHistoryOptions {
  pageSize?: number;
  debounceMs?: number;
  gitHistoryFetcher?: GitHistoryFetcherContract;
}

/**
 * useGitHistory
 * React hook to manage git commit history state for a repository.
 * Delegates fetching logic to a pure service.
 */
export function useGitHistory(
  selectedRepo: RepositoryInfo | null,
  branchName?: string,
  options?: UseGitHistoryOptions
) {
  const pageSize = options?.pageSize ?? 50;
  const debounceMs = options?.debounceMs ?? 300;
  const gitHistoryFetcher = options?.gitHistoryFetcher ?? defaultGitHistoryFetcher;

  const [history, setHistory] = useState<CommitInfo[]>([]);
  const [page, setPage] = useState<number>(1);
  const [total, setTotal] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Simple in-memory cache: { [repoId-branch-page]: FetchGitHistoryResult }
  const cacheRef = useRef<Record<string, FetchGitHistoryResult>>({});
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  const fetchHistory = useCallback(
    (params?: Partial<FetchGitHistoryParams>) => {
      if (!selectedRepo) {
        setHistory([]);
        setTotal(null);
        setError(null);
        return;
      }
      const repositoryId = selectedRepo.id;
      const branch = branchName;
      const currentPage = params?.page ?? page;
      const cacheKey = `${repositoryId}-${branch ?? ""}-${currentPage}-${pageSize}`;

      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }

      debounceTimeout.current = setTimeout(async () => {
        setLoading(true);
        setError(null);

        // Check cache
        if (cacheRef.current[cacheKey]) {
          const cached = cacheRef.current[cacheKey];
          setHistory(cached.commits);
          setTotal(cached.total);
          setLoading(false);
          return;
        }

        try {
          const result = await fetchGitHistory(
            {
              repositoryId,
              branchName: branch,
              page: currentPage,
              pageSize,
            },
            gitHistoryFetcher
          );
          setHistory(result.commits);
          setTotal(result.total);
          cacheRef.current[cacheKey] = result;
        } catch (err) {
          if (err instanceof GitHistoryServiceError) {
            setError(err.message);
          } else {
            setError("Unknown error fetching git history");
          }
          setHistory([]);
          setTotal(null);
        } finally {
          setLoading(false);
        }
      }, debounceMs);
    },
    [selectedRepo, branchName, page, pageSize, debounceMs, gitHistoryFetcher]
  );

  // Auto-fetch when repo/branch/page changes
  useEffect(() => {
    fetchHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRepo, branchName, page, pageSize]);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, []);

  const goToPage = useCallback((newPage: number) => {
    if (typeof newPage === "number" && newPage > 0) {
      setPage(newPage);
    }
  }, []);

  return {
    history,
    total,
    page,
    pageSize,
    loading,
    error,
    setError,
    fetchHistory,
    goToPage,
  };
}