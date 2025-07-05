import { useState, useEffect, useCallback } from 'react';

import { IPCResponse } from "@/shared/ipc-types";

interface IpcQueryState<T> {
  data: IPCResponse<T> | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Custom hook to perform an IPC query (invoke) to the main process.
 * Manages loading, data, and error states, similar to react-query.
 *
 * @param channel The IPC channel to invoke.
 * @param params Parameters to send with the IPC call.
 * @param options Optional configuration.
 * @param options.enabled Whether the query should automatically run. Defaults to true.
 *                      If false, the query will not run until `refetch` is called.
 * @returns An object containing data, isLoading, error, and a refetch function.
 */
export function useIpcQuery<TResponse, TRequest = undefined>(
  channel: string,
  params?: TRequest,
  options: { enabled?: boolean; staleTime?: number; onError?: (error: Error) => void } = { enabled: true }
): IpcQueryState<TResponse> {
  const [data, setData] = useState<IPCResponse<TResponse> | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(options.enabled || false);
  const [error, setError] = useState<Error | null>(null);
  const [lastFetched, setLastFetched] = useState<number>(0);

  const fetchData = useCallback(async () => {
    if (!window.electronIPC) {
      console.error('Electron IPC bridge not available. Ensure preload script is correctly configured.');
      setError(new Error('Electron IPC bridge not available.'));
      setIsLoading(false);
      return;
    }

    const now = Date.now();
    if (options.staleTime && now - lastFetched < options.staleTime) {
      // Data is not stale, no need to refetch
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await window.electronIPC.invoke<IPCResponse<TResponse>>(channel, params);
      setData(result);
      setLastFetched(now);
    } catch (err: unknown) {
      console.error(`Error invoking IPC channel ${channel}:`, err);
      let errorMessage = 'An unknown error occurred';
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'object' && err !== null && 'message' in err) {
        errorMessage = String((err as { message: unknown }).message);
      } else {
        errorMessage = String(err);
      }
      setError(new Error(errorMessage));
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, [channel, params, options.staleTime, lastFetched]);

  useEffect(() => {
    if (options.enabled) {
      fetchData();
    }
  }, [fetchData, options.enabled]);

  const refetch = useCallback(() => {
    // Force refetch
    fetchData();
  }, [fetchData]);

  return { data, isLoading, error, refetch };
}

// Example Usage (for documentation purposes, not to be run here):
/*
  // In a component:
  // No parameters
  // const { data: projectsData, isLoading: isLoadingProjects, error: projectsError, refetch: refetchProjects } =
  //   useIpcQuery<GetProjectsResponse>(GET_PROJECTS_CHANNEL);

  // With parameters
  // const { data: projectDetails, isLoading: isLoadingDetails, error: detailsError, refetch: refetchDetails } =
  //   useIpcQuery<GetProjectDetailsResponse, GetProjectDetailsRequest>(
  //     GET_PROJECT_DETAILS_CHANNEL,
  //     { projectId: 'some-id' }
  //   );

  // Query initially disabled
  // const { data: userData, isLoading: isLoadingUser, refetch: fetchUser } =
  //   useIpcQuery<GetUserProfileResponse>(GET_USER_PROFILE_CHANNEL, undefined, { enabled: false });
  // ... later call fetchUser() when needed
*/
